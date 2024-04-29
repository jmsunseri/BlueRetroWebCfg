<script lang="ts">
	import '../app.postcss';
	import { AppShell, AppBar } from '@skeletonlabs/skeleton';
	import { IconBrandGithub, IconBrandDiscord, IconX } from '@tabler/icons-svelte';
	import { brUuid, cfg_cmd_get_fw_name } from '../../../utils/constants';

	// Floating UI for Popups
	import { computePosition, autoUpdate, flip, shift, offset, arrow } from '@floating-ui/dom';
	import { storePopup } from '@skeletonlabs/skeleton';
	import { deviceConfig, device } from '$lib/stores';
	storePopup.set({ computePosition, autoUpdate, flip, shift, offset, arrow });

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

	const getApiVersion = async (service: BluetoothRemoteGATTService) => {
		console.log('Reading Api version...');
		const characteristics = await service.getCharacteristic(brUuid[6]);
		const dataview = await characteristics.readValue();
		return dataview.getUint8(0);
	};

	const getGlobalConfig = async (service: BluetoothRemoteGATTService) => {
		const charactristic = await service.getCharacteristic(brUuid[1]);
		const dataview = await charactristic.readValue();

		const globalConfig: IGlobalConfig = {
			apiVersion: await getApiVersion(service),
			system: dataview.getUint8(0),
			multitap: dataview.getUint8(1)
		};

		if (globalConfig.apiVersion > 0) {
			globalConfig.inquiryMode = dataview.getUint8(2);
		}
		if (globalConfig.apiVersion > 1) {
			globalConfig.bank = dataview.getUint8(3);
		}

		return globalConfig;
	};

	const getOutputConfig = async (service: BluetoothRemoteGATTService) => {
		// const charOne = await service.getCharacteristic(brUuid[2]);
		// console.log('charOne', await charOne.readValue());

		const charTwo = await service.getCharacteristic(brUuid[3]);
		console.log('charTwo', await charTwo.readValue());
	};

	const unselectDevice = () => {
		device.set(undefined);
		deviceConfig.set(undefined);
	};

	$: isHw2 =
		$deviceConfig?.appVersion?.indexOf('hw2') != -1 || $deviceConfig?.appName?.indexOf('hw2') != -1;

	const getDevice = async (): Promise<BluetoothDevice> => {
		console.log('Requesting Bluetooth Device...');
		const d = await navigator.bluetooth.requestDevice({
			filters: [{ namePrefix: 'BlueRetro' }],
			optionalServices: [brUuid[0]]
		});
		device.set(d);
		return d;
	};

	const initDeviceConfiguration = async (service: BluetoothRemoteGATTService) => {
		await getOutputConfig(service);

		const config: IDeviceConfig = {
			bluetoothAddress: await getBdAddr(service),
			appVersion: await getAppVersion(service),
			globalConfig: await getGlobalConfig(service)
		};

		const app_ver_is_18x = config.appVersion.indexOf('v1.8') != -1;
		const app_ver_bogus = config.appVersion.indexOf('v') == -1;
		if (!app_ver_is_18x && !app_ver_bogus) {
			config.appName = await getStringCmd(service, cfg_cmd_get_fw_name);
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

		console.log('device config', config);
		deviceConfig.set(config);
	};

	const getService = async (device: BluetoothDevice): Promise<BluetoothRemoteGATTService> => {
		try {
			console.log('Connecting to GATT Server...');
			if (!device.gatt?.connected) {
				await device.gatt?.connect();
			}
			if (device.gatt) {
				console.log('Getting BlueRetro Service...');
				return await device.gatt.getPrimaryService(brUuid[0]);
			} else {
				return await getService(device);
			}
		} catch {
			return await getService(device);
		}
	};

	const selectDevice = async () => {
		try {
			const device = await getDevice();
			const service = await getService(device);
			await initDeviceConfiguration(service);
			device.gatt?.disconnect();
		} catch (error) {
			console.log('Argh! ' + error);
		}
	};
</script>

<!-- App Shell -->
<AppShell slotSidebarLeft="bg-surface-500/5 w-56 p-4">
	<svelte:fragment slot="header">
		<!-- App Bar -->
		<AppBar>
			<svelte:fragment slot="lead">
				<strong class="text-xl">BlueRetro Web Configuration</strong>
			</svelte:fragment>
			<svelte:fragment slot="trail">
				<div>
					<a class="btn-icon" href="https://discord.gg/EXqV7W8MtY" target="_blank" rel="noreferrer">
						<IconBrandDiscord />
					</a>
					<a
						class="btn-icon"
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
		<!-- Insert the list: -->
		<nav class="list-nav">
			<ul>
				<p class="font-bold pl-4 text-xl">Controller</p>
				<li><a href="/controller/global">Global</a></li>
				<li><a href="/controller/output">Output</a></li>
				<li><a href="/controller/buttons">Button Mappings</a></li>
				<li><a href="/controller/presets">Presets</a></li>
				<li><a href="/controller/n64">N64 Controller Pack</a></li>
				<p class="font-bold pl-4 text-xl">System</p>
				<li><a href="/system/manage">Manage</a></li>
				<li><a href="/system/update">Update Firmware</a></li>
			</ul>
		</nav>
		<!-- --- -->
	</svelte:fragment>
	<div class="p-4 flex gap-4 flex md:flex-row flex-col max-w-screen-md">
		<div class="flex flex-col gap-4 flex-1">
			{#if !$device}
				<div class="flex-col">
					<div class="flex gap-4 items-center">
						<button type="button" class="btn variant-filled" on:click={selectDevice}>
							Select Device
						</button>
					</div>

					<p class="text-sm">Disconnect all controllers from BlueRetro before connecting.</p>
				</div>
			{:else}
				<div class="border-token rounded-token border-success-500 flex flex-start gap-4">
					<div class="flex-1 flex flex-col p-4">
						<p class="font-bold pb-4 text-xl">Selected BlueRetro Device</p>
						<p>Device Name: {$device?.name || '...'}</p>
						<p>
							Installed Version: {$deviceConfig?.appVersion || '...'}
						</p>
						<p>Bluetooth Address: {$deviceConfig?.bluetoothAddress || '...'}</p>
					</div>
					<div>
						<button type="button" class="btn-icon" on:click={unselectDevice}>
							<IconX />
						</button>
					</div>
				</div>
			{/if}
		</div>
	</div>

	<div class="p-4 flex flex-col gap-4 max-w-screen-md">
		<slot />
	</div>
	<!-- Page Route Content -->
</AppShell>
