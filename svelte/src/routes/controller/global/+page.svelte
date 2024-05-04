<script lang="ts">
	import {} from '$lib/stores';
	import {
		systemCfg as systems,
		multitapCfg as multitaps,
		inquiryMode as inquiryModes
	} from '$lib/constants';
	let selectedSystem: number | undefined;
	let selectedMultitap: number | undefined;
	let selectedInquriyMode: number | undefined;
	let selectedBank: number | undefined;
</script>

<label class="label">
	<span>System</span>
	<select class="select" bind:value={selectedSystem}>
		{#each systems as system, i}
			<option value={i}>{system}</option>
		{/each}
	</select>
</label>
<label class="label">
	<span>Multitap</span>
	<select class="select" bind:value={selectedMultitap}>
		{#each multitaps as multitap, i}
			<option value={i}>{multitap}</option>
		{/each}
	</select>
</label>
<label class="label">
	<span>Inquiry Mode</span>
	<select class="select" bind:value={selectedInquriyMode}>
		{#each inquiryModes as inquiryMode, i}
			<option value={i}>{inquiryMode}</option>
		{/each}
	</select>
</label>
<label class="label">
	<span>Memory Card Bank</span>
	<select class="select" bind:value={selectedBank}>
		{#each { length: 4 } as _, i}
			<option value={i}>Bank {i + 1}</option>
		{/each}
	</select>
</label>

<button type="button" class="btn variant-filled">Save</button>
