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
	import { device, deviceConfig, service } from '$lib/stores';
	import { FileButton, getToastStore } from '@skeletonlabs/skeleton';
	import { getSendToast, getService } from '$lib/utilities';
	import { UploadProgress } from '$lib/components';

	let latestVersion: string | undefined = $state();
	let isDoingSomething = $state(false);
	let progress = $state(0);
	let isCanceling = false;
	let files: FileList | undefined = $state();

	const sendToast = getSendToast(getToastStore());

	onMount(async () => {
		const response = await fetch(urlLatestRelease);
		const json = await response.json();
		latestVersion = json.tag_name;
	});

	let upgradeAvailable = $derived(latestVersion && $deviceConfig?.appVersion?.indexOf(latestVersion) == -1);

	let isHw2 =
		$derived($deviceConfig?.appVersion?.indexOf('hw2') != -1 || $deviceConfig?.appName?.indexOf('hw2') != -1);

	const otaWriteFwRecursive = async (
		chrc: BluetoothRemoteGATTCharacteristic,
		data: ArrayBuffer,
		offset: number
	) => {
		if (isCanceling) {
			isCanceling = false;
			isDoingSomething = false;
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
		try {
			isDoingSomething = true;
			const serv = await getService();
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
						await otaWriteFirmware(serv, reader.result as ArrayBuffer);
						sendToast('success', 'Success updating firmware');
						device.set(undefined);
					} else {
						sendToast('error', 'Hardware and firmware mismatch!');
					}
				}

				isDoingSomething = false;
				progress = 0;
				$device?.gatt?.disconnect();
				device.set(undefined);
				deviceConfig.set(undefined);
				service.set(undefined);
			};

			// Read in the image file as a binary string.
			if(files && files.length) {
				reader.readAsArrayBuffer(files[0]);
			}
		} catch {
			sendToast('error', 'There was an error updating the firmware!');
			isDoingSomething = false;
			progress = 0;
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
		onclick={onWriteClick}
		class="btn variant-ghost"
		disabled={isDoingSomething || !$device || !files?.length}
	>
		Write</button
	>
</div>
<UploadProgress max={100} onCancelClick={cancelClick} {progress} {isDoingSomething} />
