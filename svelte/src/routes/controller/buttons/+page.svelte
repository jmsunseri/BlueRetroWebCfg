<script lang="ts">
	import { ButtonMapping, GameId } from '$lib/components';
	import type { IButtonMapping } from '$lib/interfaces';
	import { IconPlus, IconDeviceFloppy } from '@tabler/icons-svelte';
	import { maxMainInput, labelName as deviceLabels, brUuid, maxMappings } from '$lib/constants';
	import { isFullyInitialized } from '$lib/stores';
	import { getSendToast, getService, writeInputConfig } from '$lib/utilities';
	import { ProgressRadial, getToastStore } from '@skeletonlabs/skeleton';

	let source: number = 0;
	let input: number;
	let destination: number = 0;
	let buttonMappings: Array<IButtonMapping> = [];
	let gameId: string;
	let isDoingSomething = false;

	const sendToast = getSendToast(getToastStore());

	const removeMapping = (index: number) => {
		buttonMappings = buttonMappings.filter((_, i) => index != i);
	};

	const addMapping = () => {
		if (buttonMappings.length < maxMappings) {
			buttonMappings = [...buttonMappings, { max: 100, threshold: 50, deadzone: 135 }];
		}
	};

	const loadInputConfiguration = async (inputNumber: number) => {
		if (!isNaN(inputNumber)) {
			try {
				isDoingSomething = true;
				const config = await readInputConfiguration(inputNumber);
				let offset = 3;
				buttonMappings = new Array<IButtonMapping | undefined>(config[2]).fill({}).map((_) => ({
					source: config[offset++],
					destination: config[offset++],
					destinationId: config[offset++],
					max: config[offset++],
					threshold: config[offset++],
					deadzone: config[offset++],
					turbo: config[offset++],
					scaling: config[offset],
					diagonal: config[offset++] >> 4
				}));
			} catch (error) {
				console.log(
					`there was an error fetching button mappings for input ${inputNumber + 1}`,
					error
				);
				sendToast(
					'error',
					`There was an error fetching button mappings for input ${inputNumber + 1}`
				);
			}
			isDoingSomething = false;
		}
	};

	const readRecursive = async (
		config: Uint8Array,
		inputCtrl: Uint16Array,
		ctrl_chrc: BluetoothRemoteGATTCharacteristic,
		data_chrc: BluetoothRemoteGATTCharacteristic
	): Promise<Uint8Array> => {
		await ctrl_chrc.writeValue(inputCtrl);
		const value = await data_chrc.readValue();
		const tmp = new Uint8Array(value.buffer);
		config.set(tmp, inputCtrl[1]);
		if (value.byteLength == 512) {
			inputCtrl[1] += Number(512);
			return await readRecursive(config, inputCtrl, ctrl_chrc, data_chrc);
		} else {
			return config;
		}
	};

	const writeConfiguration = async () => {
		isDoingSomething = true;
		const config = new Uint8Array(buttonMappings.length * 8 + 3);
		let index = 0;
		config[index++] = 0;
		config[index++] = 0;
		config[index++] = buttonMappings.length;
		buttonMappings.forEach((bm: IButtonMapping) => {
			config[index++] = bm.source!;
			config[index++] = bm.destination!;
			config[index++] = bm.destinationId!;
			config[index++] = bm.max!;
			config[index++] = bm.threshold!;
			config[index++] = bm.deadzone!;
			config[index++] = bm.turbo!;
			config[index++] = bm.scaling! | (bm.diagonal! << 4);
		});

		try {
			const serv = await getService();
			await writeInputConfig(input, config, serv);
			sendToast('success', 'Success updating output configuration!');
		} catch (error) {
			console.log('there was an error writing your preset configuration', error);
			sendToast('error', 'There was an error saving ');
		}
		isDoingSomething = false;
	};

	const readInputConfiguration = async (inputNumber: number) => {
		const serv = await getService();
		const config = new Uint8Array(2051);
		const ctrl_chrc = await serv.getCharacteristic(brUuid[4]);
		const data_chrc = await serv.getCharacteristic(brUuid[5]);
		const inputCtrl = new Uint16Array([inputNumber, 0]);
		return await readRecursive(config, inputCtrl, ctrl_chrc, data_chrc);
	};

	$: {
		if ($isFullyInitialized && buttonMappings.length === 0 && !isDoingSomething) {
			loadInputConfiguration(input);
		}
	}
</script>

<GameId bind:gameId />

<div class="flex md:flex-row flex-col gap-4">
	<label class="label">
		<span>Bluetooth Device #</span>
		<select class="select" bind:value={input} on:change={() => loadInputConfiguration(input)}>
			{#each { length: maxMainInput } as _, i}
				<option value={i}>{i + 1}</option>
			{/each}
		</select>
	</label>
	<label class="label">
		<span>Source</span>
		<select class="select" bind:value={source}>
			{#each deviceLabels as deviceLabel, i}
				<option value={i}>{deviceLabel}</option>
			{/each}
		</select>
	</label>

	<label class="label">
		<span>Destination</span>
		<select class="select" bind:value={destination}>
			{#each deviceLabels as deviceLabel, i}
				<option value={i}>{deviceLabel}</option>
			{/each}
		</select>
	</label>
</div>

<button
	disabled={!$isFullyInitialized}
	class="btn variant-filled flex-row gap-4"
	on:click={writeConfiguration}
>
	Save Mappings
	{#if $isFullyInitialized && isDoingSomething}
		<ProgressRadial width="w-6" />
	{:else}
		<IconDeviceFloppy />
	{/if}
</button>

{#if buttonMappings.length}
	{#each buttonMappings as mapping, index}
		<ButtonMapping
			{index}
			onRemoveClicked={removeMapping}
			destinationSystem={destination}
			sourceSystem={source}
			bind:max={mapping.max}
			bind:turbo={mapping.turbo}
			bind:scaling={mapping.scaling}
			bind:source={mapping.source}
			bind:destination={mapping.destination}
			bind:diagonal={mapping.diagonal}
			bind:destinationId={mapping.destinationId}
			bind:deadzone={mapping.deadzone}
			bind:threshold={mapping.threshold}
		/>
	{/each}
{/if}

<button
	disabled={!$isFullyInitialized}
	class="btn variant-ghost-tertiary flex-row gap-4"
	on:click={addMapping}
>
	Add Mapping <IconPlus />
</button>
