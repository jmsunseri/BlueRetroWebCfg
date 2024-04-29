<script lang="ts">
	import {} from '$lib/stores';
	import {
		devCfg as outputModes,
		accCfg as accessories,
		maxOutput
	} from '../../../../../utils/constants';
	let selectedOutput: number | undefined;
	let selectedAccessory: number | undefined;
	let selectedMode: number | undefined;
</script>

<label class="label">
	<span>Output #</span>
	<select class="select" bind:value={selectedOutput}>
		{#each { length: maxOutput } as _, i}
			<option value={i + 1}>{i + 1}</option>
		{/each}
	</select>
</label>
<label class="label">
	<span>Mode</span>
	<select class="select" bind:value={selectedMode}>
		{#each outputModes as outputMode, i}
			<option value={i}>{outputMode}</option>
		{/each}
	</select>
</label>
<label class="label">
	<span>Accessories</span>
	<select class="select" bind:value={selectedAccessory}>
		{#each accessories as accessory, i}
			<option value={i}>{accessory}</option>
		{/each}
	</select>
</label>
<button type="button" class="btn variant-filled">Save</button>
