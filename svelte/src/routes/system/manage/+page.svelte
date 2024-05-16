<script lang="ts">
	import {
		brUuid,
		cfg_cmd_sys_deep_sleep,
		cfg_cmd_sys_factory,
		cfg_cmd_sys_reset
	} from '$lib/constants';
	import { isFullyInitialized } from '$lib/stores';
	import { getSendToast, getService } from '$lib/utilities';
	import { getToastStore, ProgressRadial } from '@skeletonlabs/skeleton';

	const sendToast = getSendToast(getToastStore());
	let isDoingSomething = false;
	let isSettingDeepSleep = false;
	let isResetting = false;
	let isFactoryResetting = false;

	const setDeepSleep = async () => {
		isDoingSomething = true;
		isSettingDeepSleep = true;
		try {
			const serv = await getService();
			const chrc = await serv.getCharacteristic(brUuid[7]);
			await chrc.writeValue(new Uint8Array([cfg_cmd_sys_deep_sleep]));
			sendToast('success', 'Success puting device to sleep.');
		} catch (error) {
			sendToast('error', 'Hardware and firmware mismatch!');
			console.log('error putting device to sleep', error);
		}
		isSettingDeepSleep = false;
		isDoingSomething = false;
	};

	const setReset = async () => {
		isDoingSomething = true;
		isResetting = true;
		try {
			const serv = await getService();
			const chrc = await serv.getCharacteristic(brUuid[7]);
			await chrc.writeValue(new Uint8Array([cfg_cmd_sys_reset]));
			sendToast('success', 'Success resetting the device.');
		} catch (error) {
			sendToast('error', 'Error resetting the device!');
			console.log('error resetting the device', error);
		}
		isResetting = false;
		isDoingSomething = false;
	};

	const setFactoryReset = async () => {
		isDoingSomething = true;
		isFactoryResetting = true;
		try {
			const serv = await getService();
			const chrc = await serv.getCharacteristic(brUuid[7]);
			await chrc.writeValue(new Uint8Array([cfg_cmd_sys_factory]));
			sendToast('success', 'Success factory resetting the device.');
		} catch (error) {
			sendToast('error', 'Error factory resetting the device!');
			console.log('error factory resetting the device', error);
		}
		isDoingSomething = false;
		isFactoryResetting = false;
	};
</script>

<div class="flex flex-col md:flex-row gap-4">
	<button
		on:click={setDeepSleep}
		disabled={!$isFullyInitialized || isDoingSomething}
		class="btn variant-ghost flex-row gap-4"
	>
		Deep Sleep
		{#if isSettingDeepSleep}
			<ProgressRadial width="w-6" />
		{/if}
	</button>
	<button
		on:click={setReset}
		disabled={!$isFullyInitialized || isDoingSomething}
		class="btn variant-ghost flex-row gap-4"
	>
		Reset
		{#if isResetting}
			<ProgressRadial width="w-6" />
		{/if}
	</button>
	<button
		on:click={setFactoryReset}
		disabled={!$isFullyInitialized || isDoingSomething}
		class="btn variant-ghost flex-row gap-4"
	>
		Factory Reset
		{#if isFactoryResetting}
			<ProgressRadial width="w-6" />
		{/if}
	</button>
</div>
