<script lang="ts">
	import {
		brUuid,
		cfg_cmd_get_cfg_src,
		cfg_cmd_set_default_cfg,
		cfg_cmd_set_gameid_cfg
	} from '$lib/constants';
	import { deviceConfig } from '$lib/stores';
	import { getGameId, getGameName } from '$lib/utilities';

	import { RadioGroup, RadioItem, getToastStore, type ToastSettings } from '@skeletonlabs/skeleton';
	let value: ControllerConfigType = 'global';
	export let service: BluetoothRemoteGATTService | undefined;
	export let gameId: string;
	let gameName: string;

	const toastStore = getToastStore();

	const getConfigSource = async (): Promise<ControllerConfigType> => {
		const cmd_chrc = await service!.getCharacteristic(brUuid[7]);
		await cmd_chrc.writeValue(new Uint8Array([cfg_cmd_get_cfg_src]));
		const value = await cmd_chrc.readValue();
		return value.getUint8(0) === 0 ? 'global' : 'gameid';
	};

	const setConfig = async (configValue: number) => {
		const chrc = await service!.getCharacteristic(brUuid[7]);
		await chrc.writeValue(new Uint8Array([configValue]));
	};

	const setDefaultConfig = async () => {
		await setConfig(cfg_cmd_set_default_cfg);
	};

	const setGameIdConfig = async () => {
		await setConfig(cfg_cmd_set_gameid_cfg);
	};

	const onChange = async () => {
		if (value === 'gameid') {
			try {
				await setGameIdConfig();
				deviceConfig.update((c) => ({
					...c,
					source: 'gameid'
				}));
				gameId = await getGameId(service!);
				console.log('game id detected: ', gameId);
				gameName = (await getGameName(gameId))?.toString() || '';
				console.log('game name: ', gameName);
			} catch (error) {
				console.log('there was an error switching to gameid mode', error);
				const t: ToastSettings = {
					message: 'There was an error switching to gameid mode ',
					autohide: false,
					background: 'variant-filled-error'
				};
				toastStore.trigger(t);
			}
		} else {
			try {
				await setDefaultConfig();
				deviceConfig.update((c) => ({
					...c,
					source: 'global'
				}));
				gameId = '';
				gameName = '';
			} catch (error) {
				console.log('there was an error switching to global mode', error);
				const t: ToastSettings = {
					message: 'There was an error switching to global mode ',
					autohide: false,
					background: 'variant-filled-error'
				};
				toastStore.trigger(t);
			}
		}
	};

	// $: if ($deviceConfig && !$deviceConfig.source && service) {
	// 	getConfigSource().then((source) => {
	// 		value = source;
	// 	});
	// }
</script>

<div class="flex flex-col gap-1">
	<!-- svelte-ignore a11y-label-has-associated-control -->
	<label class="label">
		<span>Config</span>
	</label>
	<RadioGroup
		active="variant-filled-primary"
		hover="hover:variant-soft-primary"
		rounded="rounded-token"
	>
		<RadioItem
			bind:group={value}
			on:change={onChange}
			name="justify"
			value={'global'}
			disabled={!service}>Global</RadioItem
		>
		<RadioItem
			bind:group={value}
			on:change={onChange}
			name="justify"
			value={'gameid'}
			disabled={!service}>Game ID</RadioItem
		>
	</RadioGroup>
	{#if gameName}
		<p class="text-sm">
			You are editing the controller configuration for the game {gameName}
		</p>
	{:else}
		<p class="text-sm">
			Start the game you wish to configure button mappings for, disconnect all controllers from
			BlueRetro, and press the Game ID button
		</p>
	{/if}
</div>
