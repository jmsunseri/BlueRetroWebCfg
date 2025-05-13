<script lang="ts">
	import {
		brUuid,
		cfg_cmd_get_cfg_src,
		cfg_cmd_set_default_cfg,
		cfg_cmd_set_gameid_cfg
	} from '$lib/constants';
	import { deviceConfig, isFullyInitialized } from '$lib/stores';
	import { getGameId, getGameName, toaster, getService } from '$lib/utilities';
	import { Segment } from '@skeletonlabs/skeleton-svelte';

	interface Props {
		gameId: string;
	}

	let { gameId = $bindable() }: Props = $props();
	let gameName: string | undefined = $state();
	let value: ControllerConfigType = $state('global');


	const getConfigSource = async (): Promise<ControllerConfigType> => {
		const serv = await getService();
		const cmd_chrc = await serv.getCharacteristic(brUuid[7]);
		await cmd_chrc.writeValue(new Uint8Array([cfg_cmd_get_cfg_src]));
		const value = await cmd_chrc.readValue();
		return value.getUint8(0) === 0 ? 'global' : 'gameid';
	};

	const setConfig = async (configValue: number) => {
		const serv = await getService();
		const chrc = await serv.getCharacteristic(brUuid[7]);
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
				const serv = await getService();
				await setGameIdConfig();
				deviceConfig.update((c) => ({
					...c,
					source: 'gameid'
				}));
				gameId = await getGameId(serv);
				console.log('game id detected: ', gameId);
				gameName = (await getGameName(gameId))?.toString() || '';
				console.log('game name: ', gameName);
			} catch (error) {
				console.log('there was an error switching to gameid mode', error);
				toaster.error({ title: 'There was an error switching to gameid mode'});
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
				toaster.error({ title: 'There was an error switching to global mode'});
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
	<!-- svelte-ignore a11y_label_has_associated_control -->
	<label class="label">
		<span>Config</span>
	</label>
	<Segment
		active="preset-filled-primary-500"
		hover="hover:preset-tonal-primary"
		rounded="rounded-base"
	>
		<Segment.Item
			bind:group={value}
			on:change={onChange}
			name="justify"
			value={'global'}
			disabled={!isFullyInitialized}>Global</Segment.Item
		>
		<Segment.Item
			bind:group={value}
			on:change={onChange}
			name="justify"
			value={'gameid'}
			disabled={!isFullyInitialized}>Game ID</Segment.Item
		>
	</Segment>
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
