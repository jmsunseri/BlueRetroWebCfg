import { brUuid } from '$lib/constants';

export const getService = async (device: BluetoothDevice): Promise<BluetoothRemoteGATTService> => {
    try {
        if (!device.gatt?.connected) {
            console.log('Connecting to GATT Server...');
            await device.gatt?.connect();
        }
        if (device.gatt) {
            console.log('Getting BlueRetro Service...');
            return device.gatt.getPrimaryService(brUuid[0]);
        } else {
            return getService(device);
        }
    } catch (error) {
        console.log('error connecting to gat service');
        return getService(device);
    }
};