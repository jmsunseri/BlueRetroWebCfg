<script lang="ts">
	import { service, device } from '$lib/stores';
	import { devCfg as outputModes, accCfg as accessories, maxOutput, brUuid } from '$lib/constants';
	import type { ToastSettings } from '@skeletonlabs/skeleton';
	import { getToastStore } from '@skeletonlabs/skeleton';

	const toastStore = getToastStore();
	let output: number = 0;
	let accessory: number = 0;
	let mode: number = 0;

	let isLoadingConfig = false;

	const loadOutputConfig = async (s: BluetoothRemoteGATTService, configId: number) => {
		let chrc = await s.getCharacteristic(brUuid[2]);
		var outputCtrl = new Uint16Array([configId]);
		await chrc.writeValue(outputCtrl);

		chrc = await s.getCharacteristic(brUuid[3]);
		const value = await chrc.readValue();

		mode = value.getUint8(0);
		accessory = value.getUint8(1);
	};

	const saveOutputConfig = async () => {
		if ($service) {
			isLoadingConfig = true;
			try {
				var data = new Uint8Array([mode, accessory]);
				let chrc = await $service.getCharacteristic(brUuid[2]);

				var outputCtrl = new Uint16Array([output]);
				await chrc.writeValue(outputCtrl);

				chrc = await $service.getCharacteristic(brUuid[3]);
				await chrc.writeValue(data);
				const t: ToastSettings = {
					message: `Success updating output ${output + 1}`,
					background: 'variant-filled-success'
				};
				toastStore.trigger(t);
			} catch (error) {
				console.log(`There was and error trying to save output ${output + 1}`, error);
				const t: ToastSettings = {
					message: `There was an error trying to save output ${output + 1}!`,
					autohide: false,
					background: 'variant-filled-error'
				};
			}
			isLoadingConfig = false;
		}
	};

	$: if (!!$service && !!$device) {
		loadOutputConfig($service, output);
	}
</script>

<label class="label">
	<span>Output #</span>
	<select class="select" bind:value={output}>
		{#each { length: maxOutput } as _, i}
			<option value={i}>{i + 1}</option>
		{/each}
	</select>
</label>
<label class="label">
	<span>Mode</span>
	<select class="select" bind:value={mode} disabled={isLoadingConfig}>
		{#each outputModes as outputMode, i}
			<option value={i}>{outputMode}</option>
		{/each}
	</select>
</label>
<label class="label">
	<span>Accessories</span>
	<select class="select" bind:value={accessory} disabled={isLoadingConfig}>
		{#each accessories as accessory, i}
			<option value={i}>{accessory}</option>
		{/each}
	</select>
</label>
<button
	disabled={!$service || isLoadingConfig}
	on:click={saveOutputConfig}
	type="button"
	class="btn variant-filled"
>
	Save
</button>
