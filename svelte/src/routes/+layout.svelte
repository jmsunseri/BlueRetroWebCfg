<script lang="ts">
	import '../app.postcss';
	import {
		AppShell,
		AppBar,
		ProgressRadial,
		Drawer,
		Toast,
		storePopup,
		initializeStores,
		getDrawerStore,
		getToastStore,
		popup,
		type PopupSettings
	} from '@skeletonlabs/skeleton';
	import {
		IconBrandGithub,
		IconBrandDiscord,
		IconMenu2,
		IconBluetoothConnected,
		IconBluetoothOff
	} from '@tabler/icons-svelte';
	import { brUuid, cfg_cmd_get_fw_name, maxConnectRetries } from '$lib/constants';
	import { deviceConfig, device, service } from '$lib/stores';
	import { NavigationMenu } from '$lib/components';
	import type { IDeviceConfig } from '$lib/interfaces';
	import { getSendToast, getService } from '$lib/utilities';

	// Floating UI for Popups
	import { computePosition, autoUpdate, flip, shift, offset, arrow } from '@floating-ui/dom';
	storePopup.set({ computePosition, autoUpdate, flip, shift, offset, arrow });

	initializeStores();
	const drawerStore = getDrawerStore();
	const sendToast = getSendToast(getToastStore());
	let isGettingService = false;

	let connectedPopup: PopupSettings = {
		target: 'connectedPopup',
		event: 'click'
	};

	let disconnectedPopup: PopupSettings = {
		target: 'disconnectedPopup',
		event: 'click'
	};

	const getAppVersion = async (service: BluetoothRemoteGATTService) => {
		const charactristics = await service.getCharacteristic(brUuid[9]);
		console.log('Reading App version...');
		let enc = new TextDecoder('utf-8');
		let app_ver = enc.decode(await charactristics.readValue());
		return app_ver;
	};

	const getStringCmd = async (service: BluetoothRemoteGATTService, command: number) => {
		var cmd = new Uint8Array(1);
		var cmd_chrc = await service.getCharacteristic(brUuid[7]);
		cmd[0] = command;
		cmd_chrc.writeValue(cmd);
		const dataview = await cmd_chrc.readValue();
		let enc = new TextDecoder('utf-8');
		let commandString = enc.decode(dataview);
		return commandString;
	};

	const getBdAddr = async (service: BluetoothRemoteGATTService) => {
		const charactristics = await service.getCharacteristic(brUuid[12]);
		const dataview = await charactristics.readValue();
		let address =
			dataview.getUint8(5).toString(16).padStart(2, '0') +
			':' +
			dataview.getUint8(4).toString(16).padStart(2, '0') +
			':' +
			dataview.getUint8(3).toString(16).padStart(2, '0') +
			':' +
			dataview.getUint8(2).toString(16).padStart(2, '0') +
			':' +
			dataview.getUint8(1).toString(16).padStart(2, '0') +
			':' +
			dataview.getUint8(0).toString(16).padStart(2, '0');
		return address;
	};

	const unselectDevice = () => {
		device.set(undefined);
		deviceConfig.set(undefined);
		service.set(undefined);
	};

	const getDevice = async (): Promise<BluetoothDevice> => {
		console.log('Requesting Bluetooth Device...');
		const d = await navigator.bluetooth.requestDevice({
			filters: [{ namePrefix: 'BlueRetro' }],
			optionalServices: [brUuid[0]]
		});
		return d;
	};

	const initDeviceConfiguration = async (s: BluetoothRemoteGATTService) => {
		// await getOutputConfig(service);

		const bluetoothAddress = await getBdAddr(s);
		const appVersion = await getAppVersion(s);

		const config: IDeviceConfig = {
			bluetoothAddress,
			appVersion
			// globalConfig: await getGlobalConfig(service)
		};

		const app_ver_is_18x = appVersion.indexOf('v1.8') != -1;
		const app_ver_bogus = appVersion.indexOf('v') == -1;
		if (!app_ver_is_18x && !app_ver_bogus) {
			config.appName = await getStringCmd(s, cfg_cmd_get_fw_name);
			console.log(
				'Connected to: ' +
					config.appName +
					' (' +
					config.bluetoothAddress +
					') [' +
					config.appVersion +
					']'
			);
		}
		deviceConfig.set(config);
		service.set(s);
	};

	const initializeDevice = async (dev: BluetoothDevice, retry: number = 0) => {
		if (retry < maxConnectRetries) {
			try {
				const service = await getService(dev);
				if (service) {
					await initDeviceConfiguration(service);
					sendToast('success', `Successfully connected to the BlueRetro service`);
				} else {
					sendToast('error', `Max connection reties reached: ${maxConnectRetries}`);
				}
			} catch (error) {
				console.log('Error initializing device', error);
				await initializeDevice(dev, retry + 1);
			}
		} else {
			throw 'There was an error initializing the device max retries exceeded';
		}
	};

	const selectDevice = async () => {
		isGettingService = true;
		try {
			const dev = await getDevice();
			dev.gatt?.connected;
			await initializeDevice(dev);
			device.set(dev);
		} catch (error) {
			sendToast('error', `There was an error connecting to the device`);
			console.log('Argh! ' + error);
		}
		isGettingService = false;
	};

	const onMenuClick = () => {
		drawerStore.open({});
	};

	const onSwitchDeviceClick = async () => {
		if ($device?.gatt?.connected) {
			$device.gatt.disconnect();
		}
		unselectDevice();
		await selectDevice();
	};

	const onDisconnectClick = async () => {
		if ($device?.gatt?.connected) {
			$device.gatt.disconnect();
		}
		unselectDevice();
	};
</script>

<Drawer>
	<NavigationMenu />
</Drawer>
<!-- App Shell -->
<AppShell slotSidebarLeft="bg-surface-500/5 md:w-56 w-0 md:p-4">
	<svelte:fragment slot="header">
		<!-- App Bar -->
		<AppBar background="bg-surface-700" padding="p-2 md:p-4">
			<svelte:fragment slot="lead">
				<div class="flex flex-row gap-4 items-center">
					<img src="/icon.png" alt="blueretro icon" class="h-12 pl-2 hidden md:flex" />
					<button class="btn btn-icon md:hidden text-white" on:click={onMenuClick}>
						<IconMenu2 />
					</button>
					<strong class="text-xl text-white">BlueRetro</strong>
				</div>
				{#if !!$device}
					<button class=" btn btn-icon text-white" use:popup={connectedPopup}>
						<IconBluetoothConnected />
					</button>
				{/if}
			</svelte:fragment>
			<svelte:fragment slot="trail">
				<div>
					<a
						class="btn-icon text-white"
						href="https://discord.gg/EXqV7W8MtY"
						target="_blank"
						rel="noreferrer"
					>
						<IconBrandDiscord />
					</a>
					<a
						class="btn-icon text-white"
						href="https://github.com/darthcloud/BlueRetro"
						target="_blank"
						rel="noreferrer"
					>
						<IconBrandGithub />
					</a>
				</div>
			</svelte:fragment>
		</AppBar>
	</svelte:fragment>
	<svelte:fragment slot="sidebarLeft">
		<NavigationMenu />
	</svelte:fragment>
	{#if !$device}
		<div class="p-4 flex gap-4 flex md:flex-row flex-col max-w-screen-md">
			<div class="flex flex-col gap-4 flex-1">
				{#if isGettingService}
					<div
						class="border-token rounded-token border-primary-500 flex text-xl font-bold flex-start gap-4 p-4 justify-center items-center"
					>
						Connecting

						<ProgressRadial width="w-10" />
					</div>
				{:else}
					<div class="flex-col">
						<div class="flex gap-4 items-center">
							<button type="button" class="btn variant-filled" on:click={selectDevice}>
								Select Device
							</button>
						</div>

						<p class="text-sm">Disconnect all controllers from BlueRetro before connecting.</p>
					</div>
				{/if}
			</div>
		</div>
	{/if}

	<div class="p-4 flex flex-col gap-4 max-w-screen-md">
		<slot />
	</div>
	<Toast position="t" />

	<!-- Page Route Content -->
</AppShell>

<div class="card p-4 max-w-sm" data-popup="connectedPopup">
	<div class="grid grid-cols-1 gap-2">
		<button class="btn" on:click={onDisconnectClick}>Disconnect</button>
		<button class="btn" on:click={onSwitchDeviceClick}>Switch Device</button>
	</div>
	<div class="arrow bg-surface-100-800-token" />
</div>
