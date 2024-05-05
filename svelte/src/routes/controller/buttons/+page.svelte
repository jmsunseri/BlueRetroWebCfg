<script lang="ts">
	import { ButtonMapping, GameId } from '$lib/components';
	import type { IButtonMapping } from '$lib/interfaces';
	import { IconPlus } from '@tabler/icons-svelte';
	import { maxMainInput, labelName as deviceLabels } from '$lib/constants';

	let selectedSource: number = 0;
	let selectedDestination: number = 0;
	let buttonMappings: Array<IButtonMapping> = [];
	let gameId = 0;

	const addMapping = () => {
		buttonMappings = [...buttonMappings, {}];
	};

	const removeMapping = (index: number) => {
		buttonMappings = buttonMappings.filter((_, i) => index != i);
	};
</script>

<GameId  />

<div class="flex md:flex-row flex-col gap-4">
	<label class="label">
		<span>Bluetooth Device #</span>
		<select class="select">
			{#each { length: maxMainInput } as _, i}
				<option value={i + 1}>{i + 1}</option>
			{/each}
		</select>
	</label>
	<label class="label">
		<span>Source</span>
		<select class="select" bind:value={selectedSource}>
			{#each deviceLabels as deviceLabel, i}
				<option value={i}>{deviceLabel}</option>
			{/each}
		</select>
	</label>

	<label class="label">
		<span>Destination</span>
		<select class="select" bind:value={selectedDestination}>
			{#each deviceLabels as deviceLabel, i}
				<option value={i}>{deviceLabel}</option>
			{/each}
		</select>
	</label>
</div>

{#each buttonMappings as mapping, index}
	<ButtonMapping
		{index}
		onRemoveClicked={removeMapping}
		destinationSystem={selectedDestination}
		sourceSystem={selectedSource}
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

<button class="btn btn-filled" on:click={addMapping}>Add Mapping <IconPlus /> </button>
