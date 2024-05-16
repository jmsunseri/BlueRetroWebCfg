import { brUuid, maxConnectRetries } from '$lib/constants';
import { device, deviceConfig, service } from '$lib/stores';
import { get } from 'svelte/store';
import { getDevice } from './getDevice';
import { getDeviceConfiguration } from './getConfiguration';

const getGattService = async (
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
                return await device.gatt.getPrimaryService(brUuid[0]);
            } else {
                return await getGattService(device, retry + 1);
            }
        } catch (error) {
            console.log('error connecting to gat service', error);
            return await getGattService(device, retry + 1);
        }
    } else {
        return undefined;
    }

};

const getService = async (retry: number = 0): Promise<BluetoothRemoteGATTService> => {
    let dev: BluetoothDevice | undefined;
    if (retry < maxConnectRetries) {
        try {
            dev = get(device);
            if (!dev) {
                console.log('Getting device');
                dev = await getDevice();
                device.set(dev);
            }

            if (!dev.gatt) {
                throw new Error('Unable to get GATT server');
            }

            let serv = get(service);
            if (!serv || !dev.gatt.connected) {
                console.log('Getting new connection to GATT service');
                serv = await getGattService(dev);
                if (!serv) {
                    throw new Error('Unable to connect to the GATT service');
                }
                const config = await getDeviceConfiguration(serv);
                deviceConfig.set(config);
                service.set(serv);
            }
            return serv;
        } catch (error) {
            if (dev) {
                console.log('Error trying to establish connection to GATT service retrying...')
                return await getService(retry + 1);
            }

        }
    }
    deviceConfig.set(undefined);
    device.set(undefined);
    service.set(undefined);
    throw new Error('Max connection retries exceeded');
}

export { getService }