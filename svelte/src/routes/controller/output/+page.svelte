<script lang="ts">
	import { service } from '$lib/stores';
	import { devCfg as outputModes, accCfg as accessories, maxOutput, brUuid } from '$lib/constants';
	import { getSendToast } from '$lib/utilities';
	import { getToastStore } from '@skeletonlabs/skeleton';

	let output: number = 0;
	let accessory: number = 0;
	let mode: number = 0;
	let isDoingSomething = false;

	const sendToast = getSendToast(getToastStore());

	const loadOutputConfig = async () => {
		try {
			isDoingSomething = true;
			let chrc = await $service!.getCharacteristic(brUuid[2]);
			await chrc.writeValue(new Uint16Array([output]));

			chrc = await $service!.getCharacteristic(brUuid[3]);
			const value = await chrc.readValue();

			mode = value.getUint8(0);
			accessory = value.getUint8(1);
		} catch (error) {
			console.log(
				`There was and error trying to retrieve your configuration for output ${output + 1}`,
				error
			);
			sendToast(
				'error',
				`There was an error trying to retrieve your configuration for output ${output + 1}!`
			);
		}
		isDoingSomething = false;
	};

	const saveOutputConfig = async () => {
		if ($service) {
			isDoingSomething = true;
			try {
				var data = new Uint8Array([mode, accessory]);
				let chrc = await $service.getCharacteristic(brUuid[2]);

				var outputCtrl = new Uint16Array([output]);
				await chrc.writeValue(outputCtrl);

				chrc = await $service.getCharacteristic(brUuid[3]);
				await chrc.writeValue(data);
				sendToast('success', `Success updating output ${output + 1}`);
			} catch (error) {
				console.log(`There was and error trying to save output ${output + 1}`, error);
				sendToast('error', `There was an error trying to save output ${output + 1}!`);
			}
			isDoingSomething = false;
		}
	};
</script>

<label class="label">
	<span>Output #</span>
	<select
		class="select"
		bind:value={output}
		on:change={loadOutputConfig}
		disabled={!$service || isDoingSomething}
	>
		{#each { length: maxOutput } as _, i}
			<option value={i}>{i + 1}</option>
		{/each}
	</select>
</label>
<label class="label">
	<span>Mode</span>
	<select class="select" bind:value={mode} disabled={!$service || isDoingSomething}>
		{#each outputModes as outputMode, i}
			<option value={i}>{outputMode}</option>
		{/each}
	</select>
</label>
<label class="label">
	<span>Accessories</span>
	<select class="select" bind:value={accessory} disabled={!$service || isDoingSomething}>
		{#each accessories as accessory, i}
			<option value={i}>{accessory}</option>
		{/each}
	</select>
</label>
<button
	disabled={!$service || isDoingSomething}
	on:click={saveOutputConfig}
	type="button"
	class="btn variant-filled"
>
	Save
</button>
