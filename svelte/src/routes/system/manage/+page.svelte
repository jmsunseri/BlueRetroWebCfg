<script lang="ts">
	import {
		brUuid,
		cfg_cmd_sys_deep_sleep,
		cfg_cmd_sys_factory,
		cfg_cmd_sys_reset
	} from '$lib/constants';
	import { service } from '$lib/stores';
	import { getSendToast } from '$lib/utilities';
	import { getToastStore } from '@skeletonlabs/skeleton';

	const sendToast = getSendToast(getToastStore());

	const setDeepSleep = async () => {
		try {
			let chrc = await $service!.getCharacteristic(brUuid[7]);
			await chrc.writeValue(new Uint8Array([cfg_cmd_sys_deep_sleep]));
			sendToast('success', 'Success puting device to sleep.');
		} catch (error) {
			sendToast('error', 'Hardware and firmware mismatch!');
			console.log('error putting device to sleep', error);
		}
	};

	const setReset = async () => {
		try {
			let chrc = await $service!.getCharacteristic(brUuid[7]);
			await chrc.writeValue(new Uint8Array([cfg_cmd_sys_reset]));
			sendToast('success', 'Success resetting the device.');
		} catch (error) {
			sendToast('error', 'Error resetting the device!');
			console.log('error resetting the device', error);
		}
	};

	const setFactoryReset = async () => {
		try {
			let chrc = await $service!.getCharacteristic(brUuid[7]);
			await chrc.writeValue(new Uint8Array([cfg_cmd_sys_factory]));
			sendToast('success', 'Success factory resetting the device.');
		} catch (error) {
			sendToast('error', 'Error fctory resetting the device!');
			console.log('error factory resetting the device', error);
		}
	};
</script>

<div class="flex flex-col md:flex-row gap-4">
	<button on:click={setDeepSleep} disabled={!$service} class="btn variant-ghost">Deep Sleep</button>
	<button on:click={setReset} disabled={!$service} class="btn variant-ghost">Reset</button>
	<button on:click={setFactoryReset} disabled={!$service} class="btn variant-ghost"
		>Factory Reset</button
	>
</div>
