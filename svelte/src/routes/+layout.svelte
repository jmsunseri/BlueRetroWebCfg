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
		IconBluetoothConnected
	} from '@tabler/icons-svelte';
	import { deviceConfig, device, service, isFullyInitialized } from '$lib/stores';
	import { NavigationMenu } from '$lib/components';
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

	const unselectDevice = () => {
		device.set(undefined);
		deviceConfig.set(undefined);
		service.set(undefined);
	};

	const initializeDevice = async () => {
		isGettingService = true;
		try {
			await getService();
			sendToast('success', `Successfully connected to the BlueRetro service`);
			isGettingService = false;
		} catch (error) {
			console.log('Error initializing device', error);
			sendToast('error', `Error initializing connection to BlueRetro device`);
			isGettingService = false;
		}
	};

	const onMenuClick = () => {
		drawerStore.open({});
	};

	const onSwitchDeviceClick = async () => {
		if ($device?.gatt?.connected) {
			$device.gatt.disconnect();
		}
		unselectDevice();
		await initializeDevice();
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
	{#if !$isFullyInitialized}
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
							<button type="button" class="btn variant-filled" on:click={initializeDevice}>
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
