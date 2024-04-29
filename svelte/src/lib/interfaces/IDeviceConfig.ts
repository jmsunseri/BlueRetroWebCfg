interface IDeviceConfig {
    appName?: string;
    bluetoothAddress: string;
    appVersion: string;
    globalConfig: IGlobalConfig;
}

interface IGlobalConfig {
    apiVersion: number;
    system: number;
    multitap: number;
    inquiryMode?: number;
    bank?: number
}