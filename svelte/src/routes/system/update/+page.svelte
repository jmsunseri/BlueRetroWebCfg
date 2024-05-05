<script lang="ts">
	import { onMount } from 'svelte';
	import {
		brUuid,
		cfg_cmd_ota_abort,
		cfg_cmd_ota_end,
		cfg_cmd_ota_start,
		mtu,
		urlLatestRelease
	} from '$lib/constants';
	import { device, deviceConfig } from '$lib/stores';
	import { FileButton, type ToastSettings } from '@skeletonlabs/skeleton';
	import { getService } from '$lib/utilities';
	import { getToastStore } from '@skeletonlabs/skeleton';
	import { UploadProgress } from '$lib/components';

	const toastStore = getToastStore();

	let latestVersion: string | undefined;
	let isDoingSomething = false;
	let progress = 0;
	let isCanceling = false;
	let files: FileList;

	onMount(async () => {
		const response = await fetch(urlLatestRelease);
		const json = await response.json();
		latestVersion = json.tag_name;
	});

	$: upgradeAvailable = latestVersion && $deviceConfig?.appVersion?.indexOf(latestVersion) == -1;

	$: isHw2 =
		$deviceConfig?.appVersion?.indexOf('hw2') != -1 || $deviceConfig?.appName?.indexOf('hw2') != -1;

	const otaWriteFwRecursive = async (
		chrc: BluetoothRemoteGATTCharacteristic,
		data: ArrayBuffer,
		offset: number
	) => {
		if (isCanceling) {
			isCanceling = false;
			throw new Error('Cancelled');
		}
		progress = Math.round((offset / data.byteLength) * 100);
		var tmpViewSize = data.byteLength - offset;
		if (tmpViewSize > mtu) {
			tmpViewSize = mtu;
		}
		var tmpView = new DataView(data, offset, tmpViewSize);
		await chrc.writeValue(tmpView);
		offset += Number(mtu);
		if (offset < data.byteLength) {
			await otaWriteFwRecursive(chrc, data, offset);
		}
	};

	const otaWriteFirmware = async (service: BluetoothRemoteGATTService, data: ArrayBuffer) => {
		const cmd = new Uint8Array([cfg_cmd_ota_start]);
		let characteristics: BluetoothRemoteGATTCharacteristic | undefined = undefined;
		try {
			characteristics = await service.getCharacteristic(brUuid[7]);
			characteristics.writeValue(cmd);
			const chrc = await service.getCharacteristic(brUuid[8]);
			await otaWriteFwRecursive(chrc, data, 0);
			cmd[0] = cfg_cmd_ota_end;
			await characteristics.writeValue(cmd);
		} catch {
			cmd[0] = cfg_cmd_ota_abort;
			characteristics?.writeValue(cmd);
		}
	};

	const onWriteClick = async () => {
		if ($device) {
			try {
				isDoingSomething = true;
				const service = await getService($device);

				const reader = new FileReader();
				reader.onabort = (_) => {
					console.log('File read cancelled');
				};
				reader.onload = async (_) => {
					if (reader.result) {
						var decoder = new TextDecoder('utf-8');
						var header = decoder.decode(reader.result.slice(0, 256) as ArrayBuffer);
						let isNewFirmwareFileHw2 = header.indexOf('hw2') != -1;
						if (isHw2 == isNewFirmwareFileHw2) {
							await otaWriteFirmware(service, reader.result as ArrayBuffer);

							const t: ToastSettings = {
								message: 'Success updating firmware',
								background: 'variant-filled-success'
							};
							toastStore.trigger(t);
							device.set(undefined);
						} else {
							const t: ToastSettings = {
								message: 'Hardware and firmware mismatch!',
								autohide: false,
								background: 'variant-filled-error'
							};
							toastStore.trigger(t);
						}
					}

					isDoingSomething = false;
					progress = 0;
					$device.gatt?.disconnect();
				};

				// Read in the image file as a binary string.
				reader.readAsArrayBuffer(files[0]);
			} catch {
				const t: ToastSettings = {
					message: 'There was an error updating the firmware!',
					autohide: false,
					background: 'variant-filled-error'
				};
				toastStore.trigger(t);
				isDoingSomething = false;
				progress = 0;
			}
		}
	};

	const cancelClick = () => {
		isCanceling = true;
	};
</script>

<p>
	Latest Verison: {latestVersion} available at
	<a class="anchor" href="https://darthcloud.itch.io/blueretro">itch.io</a>
</p>

<div class="flex md:flex-row gap-4 md:items-center flex-col">
	<div class="flex flex-row items-center gap-4">
		<FileButton
			name="files"
			bind:files
			button="btn variant-ghost"
			disabled={isDoingSomething || !$device}>Upload</FileButton
		>

		<p>Select firmware .bin</p>
	</div>

	<button
		on:click={onWriteClick}
		class="btn variant-ghost"
		disabled={isDoingSomething || !$device || !files?.length}
	>
		Write</button
	>
</div>
<UploadProgress max={100} onCancelClick={cancelClick} {progress} />
