import { writable } from 'svelte/store';
import type { IDeviceConfig } from '$lib/interfaces';

const device = writable<BluetoothDevice | undefined>();
const service = writable<BluetoothRemoteGATTService | undefined>();
const deviceConfig = writable<IDeviceConfig | undefined>();

export { device, deviceConfig, service }