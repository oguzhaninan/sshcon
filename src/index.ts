import * as SSHConfig from 'ssh-config';
import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import * as chalk from 'chalk-pipe';
import { prompt } from 'enquirer';
import Questions from './Questions';
import HostOperations from './Enums/HostOperations';
import MainMenu from './Enums/MainMenu';

interface Settings {
    configPath: string,
}

export default class SSHCon {

    private settings: Settings;
    private settingsPath: string;

    private selectedHost: string;
    private parsedSSHConfigFile: any[];

    constructor() {
        this.settingsPath = path.join(os.homedir(), '.sshcon_settings.json');

        if (fs.existsSync(this.settingsPath)) {
            try {
                this.settings = JSON.parse(fs.readFileSync(this.settingsPath, 'utf8'));
            } catch(err) {
                
            }
        } else {
            this.settings = {
                configPath: path.join(os.homedir(), '.ssh/config'),
            };
            fs.writeFileSync(this.settingsPath, JSON.stringify(this.settings));
        }
    }

    public async main(): Promise<void> {
        console.log(chalk('green')(`sshcon version ${this.getVersion()}`));

        this.showMainMenu().then(() => {
            console.log(chalk('green')(`Successfully updated.`));
        })
        .catch(_err => {
            console.log(chalk('red')('Process canceled.'))
        });

    }

    private async showMainMenu(): Promise<void> {
        const mainMenuAnswer: any = await prompt(Questions.MainMenuQuestion)

        switch (mainMenuAnswer.selectedMenu) {
            case MainMenu.DeleteHost:
            case MainMenu.CloneHost:
            case MainMenu.EditHost:
            case MainMenu.AddNewParametersToHost: {
                await this.askHostOperations(mainMenuAnswer.selectedMenu);
            } break;
            case MainMenu.AddNewHost: {
                try {
                    await this.newHost();
                } catch (err) {
                    console.log(err, 'addnewhost');
                }
            } break;
            case MainMenu.Settings: {
                await this.editSettings();
            } break;
        }
    }
    
    private async editSettings(): Promise<void> {
        Questions.SettingsForm.choices[0].initial = this.settings.configPath;
        const formPrompt: any = await prompt(Questions.SettingsForm);

        fs.writeFileSync(this.settingsPath, JSON.stringify(formPrompt.settings));
    }
    
    private async addNewParametersToHost(index: number): Promise<void> {
        const answer: { selectedParams: string[] } = await prompt(Questions.HostParams);

        const formPrompt: any = await prompt({
            name: 'newParams',
            type: 'form',
            message: 'Fill form fields.',
            choices: answer.selectedParams
                .map((item: any) => ({
                    name: item,
                    message: item,
                })),
        });

        this.parsedSSHConfigFile[index].config.push(
            ...Object.keys(formPrompt.newParams)
                .map((param: string) => ({
                    type: 1,
                    param: param,
                    separator: ' ',
                    value: formPrompt.newParams[param],
                    before: '\t',
                    after: '\n'
                }))
        );
    }

    private async newHost(): Promise<void> {
        const answer: { selectedParams: string[] } = await prompt(Questions.HostParams);

        const formPrompt: any = await prompt({
            name: 'newHost',
            type: 'form',
            message: 'Add Host',
            choices: ['Host', ...answer.selectedParams]
                .map((item: any) => ({
                    name: item,
                    message: item,
                })),
        });

        this.parseHostFile();

        const { newHost } = formPrompt;

        this.parsedSSHConfigFile.push({
            type: 1,
            param: 'Host',
            separator: ' ',
            value: newHost.Host,
            before: '\n',
            after: '\n',
            config: Object.keys(newHost).slice(1)
                .map((param: string) => ({
                    type: 1,
                    param: param,
                    separator: ' ',
                    value: newHost[param],
                    before: '\t',
                    after: '\n'
                })),
        });

        this.writeConfigFile();
    }

    private writeConfigFile(): void {
        const configContent: string = SSHConfig.stringify(this.parsedSSHConfigFile);
        fs.writeFileSync(this.settings.configPath, configContent);
    }

    private parseHostFile(): void {
        if (fs.existsSync(this.settings.configPath)) {
            const configContent = fs.readFileSync(this.settings.configPath, 'utf8');
            this.parsedSSHConfigFile = SSHConfig.parse(configContent);
        } else {
            console.log(chalk('red')(`SSH Config file does not exists: ${this.settings.configPath}`));
            process.exit(1);            
        }
    }

    private async hostList(): Promise<void> {
        this.parseHostFile();

        const questionHostList = { ...Questions.HostList };
        questionHostList.choices = this.parsedSSHConfigFile
            .filter((item: any) => item.param.trim() === 'Host')
            .map((item: any) => ({
                message: item.value,
                value: item.value,
            }));

        const answer: any = await prompt(questionHostList);
        this.selectedHost = answer.selectedHost;
    }

    private async askHostOperations(operation: HostOperations): Promise<void> {
        await this.hostList();

        const index: number = this.parsedSSHConfigFile.findIndex((item: any) => item.value === this.selectedHost);

        await this.hostOperation(operation, index);

        // write changes to file
        this.writeConfigFile();
    }

    private async hostOperation(operation: HostOperations, index: number) {
        switch (operation) {
            /**
             * Delete selected host
             */
            case HostOperations.DeleteHost: {
                this.parsedSSHConfigFile.splice(index, 1);
            }
                break;
            /**
             * Add new parameters to host
             */
            case HostOperations.AddNewParametersToHost: {
                await this.addNewParametersToHost(index);
            }
                break;
            /**
             * Edit selected host
             */
            case HostOperations.EditHost: {
                const formPrompt: any = await prompt({
                    name: 'params',
                    type: 'form',
                    message: 'Edit host',
                    choices: [{
                        param: 'Host',
                        value: this.parsedSSHConfigFile[index].value,
                    }, ...this.parsedSSHConfigFile[index].config]
                        .map((item: any) => ({
                            name: item.param,
                            message: item.param,
                            initial: item.value,
                        })),
                });

                const { params } = formPrompt;

                this.parsedSSHConfigFile[index] = {
                    type: 1,
                    param: 'Host',
                    separator: ' ',
                    value: params.Host,
                    before: '\n',
                    after: '\n',
                    config: Object.keys(params).slice(1)
                        .map((param: string) => ({
                            type: 1,
                            param: param,
                            separator: ' ',
                            value: params[param],
                            before: '\t',
                            after: '\n'
                        })),
                };
            }
                break;
            /**
             * Clone selected host
             */
            case HostOperations.CloneHost: {
                const length: number = this.parsedSSHConfigFile.push({ ...this.parsedSSHConfigFile[index] });
                await this.hostOperation(HostOperations.EditHost, length - 1);
            }
        }
    }

    private getVersion(): number {
        return require('../package.json').version;
    }
}

new SSHCon().main();