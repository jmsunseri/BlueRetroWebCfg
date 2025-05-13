<script lang="ts">
	import '../app.css';
	import { Toaster, ProgressRing, Modal } from '@skeletonlabs/skeleton-svelte';
	import {
		IconBrandGithub,
		IconBrandDiscord,
		IconMenu2,
		IconBluetoothConnected,

		IconDownload

	} from '@tabler/icons-svelte';
	import { deviceConfig, device, service, latestVersion } from '$lib/stores';
	import { NavigationMenu } from '$lib/components';
	import { getService, toaster } from '$lib/utilities';
	import { urlLatestRelease } from '$lib/constants';
	import { onMount } from 'svelte';

	interface Props {
		children?: import('svelte').Snippet;
	}

	let { children }: Props = $props();

	let isGettingService = $state(false);
	let isDrawerOpen = $state(false);
	let isConnectedModalOpen = $state(false);

	const unselectDevice = () => {
		device.set(undefined);
		deviceConfig.set(undefined);
		service.set(undefined);
	};

	const initializeDevice = async () => {
		isGettingService = true;
		try {
			await getService();
			toaster.success({ title: 'Successfully connected to the BlueRetro service' });
			isGettingService = false;
		} catch (error) {
			console.log('Error initializing device', error);
			toaster.error({ title: 'Error initializing connection to BlueRetro device' });
			isGettingService = false;
		}
	};

	onMount(async () => {
		const response = await fetch(urlLatestRelease);
		const json = await response.json();
		latestVersion.set(json.tag_name);
	});

	let upgradeAvailable = $derived($latestVersion && $deviceConfig?.appVersion?.indexOf($latestVersion) == -1);

	const onMenuClick = () => {
		isDrawerOpen = true;
	};

	const onSwitchDeviceClick = async () => {
		if ($device?.gatt?.connected) {
			$device.gatt.disconnect();
		}
		unselectDevice();
		await initializeDevice();
		isConnectedModalOpen = false;
	};

	const onDisconnectClick = async () => {
		if ($device?.gatt?.connected) {
			$device.gatt.disconnect();
		}
		unselectDevice();
		isConnectedModalOpen = false;
	};
</script>

<Modal
	open={isDrawerOpen}
	onOpenChange={(e: any) => (isDrawerOpen = e.open)}
	triggerBase="btn preset-tonal"
	contentBase="bg-surface-100-900 p-4 space-y-4 shadow-xl w-[200px] h-screen"
	positionerJustify="justify-start"
	positionerAlign=""
	positionerPadding=""
	transitionsPositionerIn={{ x: -480, duration: 200 }}
	transitionsPositionerOut={{ x: -480, duration: 200 }}
>
	{#snippet content()}
		<NavigationMenu onItemSelect={() => (isDrawerOpen = false)} />
	{/snippet}
</Modal>
<!-- App Shell -->
<div class="grid grid-rows-[auto_1fr_auto]">
	<!-- App Bar -->
	<header class="bg-surface-700 p-2 md:p-2 flex flex-row  items-center justify-between">
		<div class="flex flex-row gap-4 items-center">
			<img src="/icon.png" alt="blueretro icon" class="h-9 pl-2 hidden md:flex" />
			<button class="btn btn-icon md:hidden text-white" onclick={onMenuClick}>
				<IconMenu2 />
			</button>
			<strong class="text-xl text-white">BlueRetro</strong>
		</div>
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
	</header>
	<div class="flex flex-row">
		<aside
			class="bg-surface-500/5 md:p-4 sticky top-0 w-[200px] hidden h-screen md:block"
		>
			<NavigationMenu />
		</aside>
		<div class="flex-1 flex flex-col">
			<div class="border rounded-base border-primary-500 mt-4 ml-4 mr-4 p-4 gap-4 flex lg:flex-row flex-col">
				{#if isGettingService}
					<div
						class="flex text-xl font-bold flex-start gap-4 p-4 justify-center items-center"
					>
						Connecting

						<ProgressRing classes="w-10 h-10" value={null} />
					</div>
				{:else if $deviceConfig && $device}
						<Modal
							open={isConnectedModalOpen}
							onOpenChange={(e: any) => (isConnectedModalOpen = e.open)}
							triggerBase="btn btn preset-tonal"
							contentBase="p-4 space-y-4 shadow-xl max-w-screen-sm"
							backdropClasses="backdrop-blur-sm"
						>
							{#snippet trigger()}
								<!-- <button class="btn btn-icon h-10"> -->
									<IconBluetoothConnected class="h-10" />

									<div class="flex sm:flex-row gap-4 flex-col" >
									<div class="flex flex-row gap-4"><div class="font-bold"> Connection:</div> {$device?.name || '...'} </div>
									<div class="flex flex-row gap-4">
										<div class="font-bold">Version:</div>
										{$deviceConfig?.appVersion || '...'}
									</div>
								</div>
								<!-- </button> -->
							{/snippet}
							{#snippet content()}
								<div class="card p-4 max-w-sm">
									<div class="grid grid-cols-1 gap-2">
										<button class="btn" onclick={onDisconnectClick}>Disconnect</button>
										<button class="btn" onclick={onSwitchDeviceClick}>Switch Device</button>
									</div>
									<div class="arrow bg-surface-100-900"></div>
								</div>
							{/snippet}
						</Modal>
						{#if upgradeAvailable}
							<a class="btn preset-tonal-tertiary" href="/system/update">
								Upgrade Available!
								<IconDownload class="size-4" />
							</a>
						{/if}
				{:else}
					<div class="flex-col">
						<div class="flex gap-4 items-center">
							<button type="button" class="btn preset-filled" onclick={initializeDevice}>
								Select Device
							</button>
						</div>

						<p class="text-sm">Disconnect all controllers from BlueRetro before connecting.</p>
					</div>
				{/if}
			</div>

			<div class="p-4 flex flex-col gap-4 max-w-(--breakpoint-md)">
				{@render children?.()}
			</div>
		</div>
	</div>
	

	

	<!-- Page Route Content -->
</div>

<Toaster {toaster}></Toaster>
