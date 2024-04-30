<script lang="ts">
	import ButtonMapping from '$lib/components/ButtonMapping.svelte';
	import type { IButtonMapping } from '$lib/interfaces';
	import { maxMainInput, labelName as deviceLabels } from '../../../../../utils/constants';

	let selectedSource: number = 0;
	let selectedDestination: number = 0;
	let buttonMappings: Array<IButtonMapping> = [];
</script>

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

{#each buttonMappings as mapping}
	<ButtonMapping destinationSystem={selectedDestination} sourceSystem={selectedSource} />
{/each}
