import { brUuid, maxConnectRetries } from '$lib/constants';

export const getService = async (
    device: BluetoothDevice,
    retry: number = 0,
): Promise<BluetoothRemoteGATTService | undefined> => {

    if (retry < maxConnectRetries) {
        try {
            if (!device.gatt?.connected) {
                console.log('Connecting to GATT Server...');
                await device.gatt?.connect();
            }
            if (device.gatt?.connected) {
                console.log('Getting BlueRetro Service...');
                return device.gatt.getPrimaryService(brUuid[0]);
            } else {
                return getService(device, retry + 1);
            }
        } catch (error) {
            console.log('error connecting to gat service');
            return getService(device, retry + 1);
        }
    } else {
        return undefined;
    }

};