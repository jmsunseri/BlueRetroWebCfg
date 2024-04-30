export interface IDeviceConfig {
    appName?: string;
    bluetoothAddress: string;
    appVersion: string;
    globalConfig: IGlobalConfig;
}

export interface IGlobalConfig {
    apiVersion: number;
    system: number;
    multitap: number;
    inquiryMode?: number;
    bank?: number
}