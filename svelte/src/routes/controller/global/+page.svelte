<script lang="ts">
	import { service, deviceConfig } from '$lib/stores';
	import {
		systemCfg as systems,
		multitapCfg as multitaps,
		inquiryMode as inquiryModes,
		brUuid
	} from '$lib/constants';
	import type { IGlobalConfig } from '$lib/interfaces';
	import { getSendToast } from '$lib/utilities';
	import { getToastStore } from '@skeletonlabs/skeleton';
	
	let system: number = 0;
	let multitap: number = 0;
	let inquiryMode: number | undefined;
	let bank: number | undefined;

	const sendToast = getSendToast(getToastStore());

	const getApiVersion = async () => {
		console.log('Reading Api version...');
		const characteristics = await $service!.getCharacteristic(brUuid[6]);
		const dataview = await characteristics.readValue();
		return dataview.getUint8(0);
	};

	const loadGlobalConfig = async () => {
		const charactristic = await $service!.getCharacteristic(brUuid[1]);
		const dataview = await charactristic.readValue();

		const globalConfig: IGlobalConfig = {
			apiVersion: await getApiVersion(),
			system: dataview.getUint8(0),
			multitap: dataview.getUint8(1)
		};

		if (globalConfig.apiVersion > 0) {
			globalConfig.inquiryMode = dataview.getUint8(2);
		}
		if (globalConfig.apiVersion > 1) {
			globalConfig.bank = dataview.getUint8(3);
		}

		deviceConfig.update((c) => ({
			...c,
			globalConfig
		}));

		system = globalConfig.system;
		multitap = globalConfig.multitap;
		inquiryMode = globalConfig.inquiryMode;
		bank = globalConfig.bank;
	};

	$: if (!!$service && !$deviceConfig?.globalConfig) {
		loadGlobalConfig();
	}

	const saveGlobal = async () => {
		if ($service && $deviceConfig?.globalConfig) {
			try {
				let globalConfig: Uint8Array;
				if ($deviceConfig.globalConfig.apiVersion > 1) {
					globalConfig = new Uint8Array(4);
				} else if ($deviceConfig.globalConfig.apiVersion > 0) {
					globalConfig = new Uint8Array(3);
				} else {
					globalConfig = new Uint8Array(2);
				}
				globalConfig[0] = system;
				globalConfig[1] = multitap;
				if ($deviceConfig.globalConfig.apiVersion > 0 && inquiryMode != undefined) {
					globalConfig[2] = inquiryMode;
				}
				if ($deviceConfig.globalConfig.apiVersion > 1 && bank != undefined) {
					globalConfig[3] = bank;
				}

				const chrc = await $service.getCharacteristic(brUuid[1]);
				await chrc.writeValue(globalConfig);

				deviceConfig.update((c) => ({
					...c,
					globalConfig: {
						apiVersion: c!.globalConfig!.apiVersion,
						multitap,
						system,
						bank,
						inquiryMode
					}
				}));

				sendToast('success', 'Success updating global configuration!');
			} catch (error) {
				console.log('there was an error saving the global config', error);
				sendToast('error', 'There was an error saving the global config');
			}
		}
	};
</script>

<label class="label">
	<span>System</span>
	<select class="select" bind:value={system}>
		{#each systems as s, i}
			<option value={i}>{s}</option>
		{/each}
	</select>
</label>
<label class="label">
	<span>Multitap</span>
	<select class="select" bind:value={multitap}>
		{#each multitaps as m, i}
			<option value={i}>{m}</option>
		{/each}
	</select>
</label>
<label class="label">
	<span>Inquiry Mode</span>
	<select class="select" bind:value={inquiryMode}>
		{#each inquiryModes as m, i}
			<option value={i}>{m}</option>
		{/each}
	</select>
</label>
<label class="label">
	<span>Memory Card Bank</span>
	<select class="select" bind:value={bank}>
		{#each { length: 4 } as _, i}
			<option value={i}>Bank {i + 1}</option>
		{/each}
	</select>
</label>

<button disabled={!$service} type="button" class="btn variant-filled" on:click={saveGlobal}>
	Save
</button>
