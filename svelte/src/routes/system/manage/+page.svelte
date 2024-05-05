<script lang="ts">
	import {
		brUuid,
		cfg_cmd_sys_deep_sleep,

		cfg_cmd_sys_factory,

		cfg_cmd_sys_reset


	} from '$lib/constants';
	import { service } from '$lib/stores';
	import { getToastStore, type ToastSettings } from '@skeletonlabs/skeleton';

	const toastStore = getToastStore();

	const setDeepSleep = async () => {
		try {
			let chrc = await $service!.getCharacteristic(brUuid[7]);
			await chrc.writeValue(new Uint8Array([cfg_cmd_sys_deep_sleep]));
			const t: ToastSettings = {
				message: 'Success puting device to sleep.',
				background: 'variant-filled-success'
			};
			toastStore.trigger(t);
		} catch (error) {
			const t: ToastSettings = {
				message: 'Hardware and firmware mismatch!',
				autohide: false,
				background: 'variant-filled-error'
			};
			toastStore.trigger(t);
			console.log('error putting device to sleep', error);
		}
	}

	const setReset = async () => {
		try {
			let chrc = await $service!.getCharacteristic(brUuid[7]);
			await chrc.writeValue(new Uint8Array([cfg_cmd_sys_reset]));
			const t: ToastSettings = {
				message: 'Success resetting the device.',
				background: 'variant-filled-success'
			};
			toastStore.trigger(t);
		} catch (error) {
			const t: ToastSettings = {
				message: 'Error resetting the device!',
				autohide: false,
				background: 'variant-filled-error'
			};
			toastStore.trigger(t);
			console.log('error resetting the device', error);
		}
	}

	const setFactoryReset = async () => {
		try {
			let chrc = await $service!.getCharacteristic(brUuid[7]);
			await chrc.writeValue(new Uint8Array([cfg_cmd_sys_factory]));
			const t: ToastSettings = {
				message: 'Success factory resetting the device.',
				background: 'variant-filled-success'
			};
			toastStore.trigger(t);
		} catch (error) {
			const t: ToastSettings = {
				message: 'Error fctory resetting the device!',
				autohide: false,
				background: 'variant-filled-error'
			};
			toastStore.trigger(t);
			console.log('error factory resetting the device', error);
		}
	}

	
</script>
<div class="flex flex-col md:flex-row gap-4">
	<button on:click={setDeepSleep} disabled={!$service} class="btn variant-ghost">Deep Sleep</button>
	<button on:click={setReset} disabled={!$service} class="btn variant-ghost">Reset</button>
	<button on:click={setFactoryReset} disabled={!$service} class="btn variant-ghost">Factory Reset</button>
</div>
