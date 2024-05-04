<script lang="ts">
	import '../app.postcss';
	import { AppShell, AppBar, ProgressRadial, Toast } from '@skeletonlabs/skeleton';
	import { IconBrandGithub, IconBrandDiscord, IconX } from '@tabler/icons-svelte';
	import { brUuid, cfg_cmd_get_fw_name } from '$lib/constants';
	import { deviceConfig, device, service } from '$lib/stores';
	import type { IDeviceConfig, IGlobalConfig } from '$lib/interfaces';
	import { getService } from '$lib/utilities';

	// Floating UI for Popups
	import { computePosition, autoUpdate, flip, shift, offset, arrow } from '@floating-ui/dom';
	import { storePopup } from '@skeletonlabs/skeleton';
	storePopup.set({ computePosition, autoUpdate, flip, shift, offset, arrow });

	import { initializeStores } from '@skeletonlabs/skeleton';
	import { page } from '$app/stores';

	initializeStores();

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

	// const getGlobalConfig = async (service: BluetoothRemoteGATTService) => {
	// 	const charactristic = await service.getCharacteristic(brUuid[1]);
	// 	const dataview = await charactristic.readValue();

	// 	const globalConfig: IGlobalConfig = {
	// 		apiVersion: await getApiVersion(service),
	// 		system: dataview.getUint8(0),
	// 		multitap: dataview.getUint8(1)
	// 	};

	// 	if (globalConfig.apiVersion > 0) {
	// 		globalConfig.inquiryMode = dataview.getUint8(2);
	// 	}
	// 	if (globalConfig.apiVersion > 1) {
	// 		globalConfig.bank = dataview.getUint8(3);
	// 	}

	// 	return globalConfig;
	// };

	// const getOutputConfig = async (service: BluetoothRemoteGATTService) => {
	// 	// const charOne = await service.getCharacteristic(brUuid[2]);
	// 	// console.log('charOne', await charOne.readValue());

	// 	const charTwo = await service.getCharacteristic(brUuid[3]);
	// 	console.log('charTwo', await charTwo.readValue());
	// };

	const unselectDevice = () => {
		device.set(undefined);
		deviceConfig.set(undefined);
	};

	const getDevice = async (): Promise<BluetoothDevice> => {
		console.log('Requesting Bluetooth Device...');
		const d = await navigator.bluetooth.requestDevice({
			filters: [{ namePrefix: 'BlueRetro' }],
			optionalServices: [brUuid[0]]
		});
		device.set(d);
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

	const selectDevice = async () => {
		try {
			const device = await getDevice();
			const service = await getService(device);
			await initDeviceConfiguration(service);
			// device.gatt?.disconnect();
		} catch (error) {
			console.log('Argh! ' + error);
		}
	};

	$: classesActive = (href: string) =>
		href === $page.url.pathname ? '!variant-filled-primary' : '';
</script>

<!-- App Shell -->
<AppShell slotSidebarLeft="bg-surface-500/5 w-56 p-4">
	<svelte:fragment slot="header">
		<!-- App Bar -->
		<AppBar background="bg-surface-700">
			<svelte:fragment slot="lead">
				<div class="flex flex-row gap-4 items-center">
					<img src="/icon.png" alt="blueretro icon" class="h-12" />
					<strong class="text-xl text-white">BlueRetro Web Configuration</strong>
				</div>
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
		<!-- Insert the list: -->
		<nav class="list-nav">
			<ul>
				<p class="font-bold pl-4 text-xl">Controller</p>
				<li><a class={classesActive('/controller/global')} href="/controller/global">Global</a></li>
				<li><a class={classesActive('/controller/output')} href="/controller/output">Output</a></li>
				<li>
					<a class={classesActive('/controller/buttons')} href="/controller/buttons"
						>Button Mappings</a
					>
				</li>
				<li>
					<a class={classesActive('/controller/presets')} href="/controller/presets">Presets</a>
				</li>
				<li>
					<a class={classesActive('/controller/n64')} href="/controller/n64">N64 Controller Pack</a>
				</li>
				<p class="font-bold pl-4 text-xl">System</p>
				<li>
					<a class={classesActive('/system/manage')} href="/system/manage">Manage Files</a>
				</li>
				<li>
					<a class={classesActive('/system/update')} href="/system/update">Update Firmware</a>
				</li>
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
						{#if $device?.name && $deviceConfig?.appVersion && $deviceConfig?.bluetoothAddress}
							<p>Device Name: {$device?.name || '...'}</p>
							<p>
								Installed Version: {$deviceConfig?.appVersion || '...'}
							</p>
							<p>Bluetooth Address: {$deviceConfig?.bluetoothAddress || '...'}</p>
						{:else}
							<div class="flex-none flex flex-row justify-center">
								<ProgressRadial width="w-16" />
							</div>
						{/if}
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
	<Toast position="t" />

	<!-- Page Route Content -->
</AppShell>
