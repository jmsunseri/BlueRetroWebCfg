<script lang="ts">
	import { FileButton, ProgressRadial, getToastStore } from '@skeletonlabs/skeleton';
	import { block, brUuid, mtu, pakSize } from '$lib/constants';
	import { downloadFile, getSendToast, getService } from '$lib/utilities';
	import { isFullyInitialized } from '$lib/stores';
	import { UploadProgress } from '$lib/components';

	let pakNumber = 0;
	let progress = 0;
	let isDoingSomething = false;
	let isReading = false;
	let isWriting = false;
	let isFormatting = false;
	let isCanceling = false;
	let files: FileList;

	const sendToast = getSendToast(getToastStore());

	const n64ReadFileRecursive = async (
		chrc: BluetoothRemoteGATTCharacteristic,
		data: Uint8Array,
		offset: number
	): Promise<Uint8Array> => {
		if (isCanceling) {
			isCanceling = false;
			throw new Error('Cancelled');
		}
		progress = Math.round((offset / pakSize) * 100);
		const value = await chrc.readValue();
		var tmp = new Uint8Array(value.buffer);
		data.set(tmp, offset);
		offset += value.byteLength;
		if (offset < pakSize) {
			return await n64ReadFileRecursive(chrc, data, offset);
		} else {
			return data;
		}
	};

	// Init function taken from MPKEdit by bryc:
	// https://github.com/bryc/mempak/blob/dbd78db6ac55575838c6e107e5ea1e568981edc4/js/state.js#L8

	const makeFormattedPak = () => {
		function writeAt(offset: number) {
			for (let i = 0; i < 32; i++) {
				data[offset + i] = block[i];
			}
		}

		const data = new Uint8Array(32768);
		const block = new Uint8Array(32);

		// generate id block
		block[1] = 0 | ((Math.random() * 256) & 0x3f);
		block[5] = 0 | ((Math.random() * 256) & 0x7);
		block[6] = 0 | (Math.random() * 256);
		block[7] = 0 | (Math.random() * 256);
		block[8] = 0 | ((Math.random() * 256) & 0xf);
		block[9] = 0 | (Math.random() * 256);
		block[10] = 0 | (Math.random() * 256);
		block[11] = 0 | (Math.random() * 256);
		block[25] = 0x01; // device bit
		block[26] = 0x01; // bank size int (must be exactly '01')

		// calculate pakId checksum
		let sumA = 0,
			sumB = 0xfff2;
		for (let i = 0; i < 28; i += 2) {
			sumA += (block[i] << 8) + block[i + 1];
			sumA &= 0xffff;
		}
		sumB -= sumA;
		// store checksums
		block[28] = sumA >> 8;
		block[29] = sumA & 0xff;
		block[30] = sumB >> 8;
		block[31] = sumB & 0xff;

		// write checksum block to multiple sections in header page
		writeAt(32);
		writeAt(96);
		writeAt(128);
		writeAt(192);

		// init IndexTable and backup (plus checksums)
		for (let i = 5; i < 128; i++) {
			data[256 + i * 2 + 1] = 3;
			data[512 + i * 2 + 1] = 3;
		}
		data[257] = 0x71;
		data[513] = 0x71;

		//for(let i = 0; i < 32; i++) data[i] = i; // write label - needs to be verified
		//data[0] = 0x81; // libultra's 81 mark
		return data;
	};

	const n64ReadFile = async (pak: number) => {
		const serv = await getService();
		var data = new Uint8Array(pakSize);
		var offset = new Uint32Array([Number(pak) * pakSize]);
		let ctrl_chrc = await serv.getCharacteristic(brUuid[10]);
		ctrl_chrc.writeValue(offset);
		const chrc = await serv.getCharacteristic(brUuid[11]);
		await n64ReadFileRecursive(chrc, data, 0);
		offset[0] = 0;
		ctrl_chrc.writeValue(offset);
		return data;
	};

	const n64WriteRecursive = async (
		chrc: BluetoothRemoteGATTCharacteristic,
		data: ArrayBuffer,
		offset: number
	) => {
		var curBlock = ~~(offset / block) + 1;
		if (isCanceling) {
			isCanceling = false;
			throw new Error('Cancelled');
		}
		progress = Math.round((offset / data.byteLength) * 100);
		let tmpViewSize = curBlock * block - offset;
		if (tmpViewSize > mtu) {
			tmpViewSize = mtu;
		}
		var tmpView = new DataView(data, offset, tmpViewSize);
		await chrc.writeValue(tmpView);
		offset += tmpViewSize;
		if (offset < data.byteLength) {
			await n64WriteRecursive(chrc, data, offset);
		}
	};

	const n64WriteFile = async (data: ArrayBuffer, pak: number) => {
		const serv = await getService();
		const chrc = await serv.getCharacteristic(brUuid[10]);
		const offset = new Uint32Array([Number(pak) * pakSize]);
		await chrc.writeValue(offset);
		const chrc2 = await serv.getCharacteristic(brUuid[11]);
		await n64WriteRecursive(chrc2, data, 0);
		offset[0] = 0;
		await chrc.writeValue(offset);
	};

	const onReadClick = async () => {
		isReading = true;
		isDoingSomething = true;
		try {
			const data = await n64ReadFile(pakNumber);
			downloadFile(
				new Blob([data.buffer], { type: 'application/mpk' }),
				`ctrl_pak-${pakNumber + 1}.mpk`
			);
			sendToast('success', 'Success reading controller pak');
		} catch (error) {
			sendToast('error', 'There was an error reading the controller pak!');
		}
		isDoingSomething = false;
		isReading = false;
		progress = 0;
	};

	const onWriteClick = async () => {
		isDoingSomething = true;
		isWriting = true;
		try {
			const reader = new FileReader();
			reader.onabort = (_) => {
				console.log('File write cancelled');
			};
			reader.onload = async (_) => {
				const data = reader.result?.slice(0, pakSize);
				if (data && data instanceof ArrayBuffer) {
					await n64WriteFile(data, pakNumber);
				}
				sendToast('success', 'Success writing');
				isDoingSomething = false;
				isWriting = false;
				progress = 0;
			};

			// Read in the image file as a binary string.
			reader.readAsArrayBuffer(files[0]);
		} catch {
			sendToast('error', 'There was an error writing!');
			isDoingSomething = false;
			isWriting = false;
			progress = 0;
		}
	};

	const onFormatClick = async () => {
		isDoingSomething = true;
		isFormatting = true;
		try {
			await n64WriteFile(makeFormattedPak().buffer, pakNumber);
			sendToast('success', 'Success formatting');
		} catch (error) {
			sendToast('error', 'There was an error formatting!');
		}
		isDoingSomething = false;
		isFormatting = false;
		progress = 0;
	};

	const cancelClick = () => {
		isCanceling = true;
	};
</script>

<div class="flex flex-col gap-4 p-4">
	<label class="label">
		<span>Select N64 Controller Pak</span>
		<select class="select" bind:value={pakNumber} disabled={isDoingSomething}>
			{#each { length: 4 } as _, i}
				<option value={i}>Pak {i + 1}</option>
			{/each}
		</select>
	</label>

	<div class="flex md:flex-row gap-4 md:items-center flex-col">
		<button
			on:click={onReadClick}
			class="btn variant-ghost flex-row gap-4"
			disabled={isDoingSomething || !$isFullyInitialized}
		>
			Read
			{#if $isFullyInitialized && isReading}
				<ProgressRadial width="w-6" />
			{/if}
		</button>

		<button
			on:click={onFormatClick}
			class="btn variant-ghost flex-row gap-4"
			disabled={isDoingSomething || !$isFullyInitialized}
		>
			Format
			{#if $isFullyInitialized && isFormatting}
				<ProgressRadial width="w-6" />
			{/if}
		</button>

		<div class="flex flex-row items-center gap-4">
			<FileButton
				name="files"
				bind:files
				button="btn variant-ghost flex-row gap-4"
				disabled={isDoingSomething || !$isFullyInitialized}>Upload</FileButton
			>

			<p>Select .MPK file to write</p>
		</div>

		<button
			on:click={onWriteClick}
			class="btn variant-ghost flex-row gap-4"
			disabled={isDoingSomething || !$isFullyInitialized || !files?.length}
		>
			Write
			{#if $isFullyInitialized && isWriting}
				<ProgressRadial width="w-6" />
			{/if}
		</button>
	</div>
	<UploadProgress max={100} onCancelClick={cancelClick} {progress} />

	<p>
		Use <a class="anchor" href="https://bryc.github.io/mempak">https://bryc.github.io/mempak</a> (by
		<a class="anchor" href="https://github.com/bryc">bryc</a>) to manage content of .MPK files.
	</p>
</div>
