import MainMenu from "../Enums/MainMenu";

export default {
    MainMenuQuestion: {
        name: 'selectedMenu',
        type: 'select',
        message: 'Main Menu',
        choices: [
            { message: 'Add New Host', value: MainMenu.AddNewHost },
            { message: 'Add New Parameters to Host', value: MainMenu.AddNewParametersToHost },
            { message: 'Delete Host', value: MainMenu.DeleteHost },
            { message: 'Edit Host', value: MainMenu.EditHost },
            { message: 'Clone Host', value: MainMenu.CloneHost },
            { message: 'Settings', value: MainMenu.Settings },
        ],
    },
    HostParams: {
        name: 'selectedParams',
        type: 'multiselect',
        message: 'Select the parameters to use',
        hint: '(Use <space> to select, <return> to submit)',
        choices: [
            { name: 'HostName', value: 'HostName' },
            { name: 'User', value: 'User' },
            { name: 'Port', value: 'Port' },
            { name: 'IdentityFile', value: 'IdentityFile' },
            { name: 'IdentitiesOnly', value: 'IdentitiesOnly' },
            { name: 'ServerAliveInterval', value: 'ServerAliveInterval' },
            { name: 'PreferredAuthentications', value: 'PreferredAuthentications' },
            { name: 'PasswordAuthentication', value: 'PasswordAuthentication' },
            { name: 'LogLevel', value: 'LogLevel' },
            { name: 'StrictHostKeyChecking', value: 'StrictHostKeyChecking' },
            { name: 'UserKnownHostsFile', value: 'UserKnownHostsFile' },
            { name: 'VisualHostKey', value: 'VisualHostKey' },
            { name: 'Compression', value: 'Compression' },
            { name: 'LocalForward', value: 'LocalForward' },
            { name: 'RemoteForward', value: 'RemoteForward' },
            { name: 'DynamicForward', value: 'DynamicForward' },
            { name: 'ForwardAgent', value: 'ForwardAgent' },
            { name: 'ForwardX11', value: 'ForwardX11' },
            { name: 'ControlMaster', value: 'ControlMaster' },
            { name: 'ControlPath', value: 'ControlPath' },
            { name: 'ControlPersist', value: 'ControlPersist' },
        ],
    },
    HostList: {
        name: 'selectedHost',
        type: 'select',
        message: 'Select a host',
        choices: [],
    },
    SettingsForm: {
        name: 'settings',
        type: 'form',
        message: 'Edit Settings.',
        choices: [
            { name: 'configPath', message: 'Config Path', initial: '' },
        ]
    }
}