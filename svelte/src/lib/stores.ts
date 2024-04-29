import { writable } from 'svelte/store';

const device = writable<BluetoothDevice | undefined>();
const deviceConfig = writable<IDeviceConfig | undefined>();

export { device, deviceConfig }