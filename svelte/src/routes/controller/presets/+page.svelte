<script lang="ts">
	import { onMount } from 'svelte';
	import { maxMainInput } from '$lib/constants';
	import type { IPreset, IPresetFile } from '$lib/interfaces';

	const consoles: { [key: string]: IPreset[] } = {};
	let selectedPreset: IPreset | undefined = undefined;
	let selectedConsole: string | undefined = undefined;

	const getFiles = async (): Promise<IPresetFile[]> => {
		const response = await fetch(
			'https://api.github.com/repos/darthcloud/BlueRetroWebCfg/contents/map/'
		);
		return response.json();
	};

	const fetchMap = async (files: IPresetFile[]) => {
		files.forEach(async (presetFile) => {
			const response = await fetch('/config/presets/' + presetFile.name);
			const preset: IPreset = await response.json();
			consoles[preset.console] = [...(consoles[preset.console] || []), preset];
		});
	};

	onMount(async () => {
		const configFiles = await getFiles();
		await fetchMap(configFiles);
	});

	$: saveButtonEnabled = selectedPreset;
</script>

<label class="label">
	<span>Output #</span>
	<select class="select">
		{#each { length: maxMainInput } as _, i}
			<option value={i + 1}>{i + 1}</option>
		{/each}
	</select>
</label>

<label class="label">
	<span>Console</span>
	<select
		class="select"
		bind:value={selectedConsole}
		on:change={() => {
			selectedPreset = undefined;
		}}
	>
		{#each Object.keys(consoles) as console}
			<option value={console}>{console}</option>
		{/each}
	</select>
</label>

<label class="label">
	<span>Preset</span>
	<select class="select" bind:value={selectedPreset}>
		{#if selectedConsole}
			{#each consoles[selectedConsole] as preset}
				<option value={preset}>{preset.name}</option>
			{/each}
		{/if}
	</select>
</label>

<button type="button" class="btn variant-filled" disabled={!saveButtonEnabled}>Save</button>
