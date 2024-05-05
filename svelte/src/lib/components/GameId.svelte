<script lang="ts">
	import { brUuid, cfg_cmd_get_cfg_src, cfg_cmd_set_default_cfg, cfg_cmd_set_gameid_cfg } from "$lib/constants";
	import { service } from "$lib/stores";
	import { RadioGroup, RadioItem } from "@skeletonlabs/skeleton";
    export let value: ControllerConfigType = 'global'


    const getConfigSource = async () => {
        const cmd_chrc = await $service!.getCharacteristic(brUuid[7]);
        await cmd_chrc.writeValue(new Uint8Array([cfg_cmd_get_cfg_src]));
        const value = await cmd_chrc.readValue();
        return value.getUint8(0);
    };

    const setConfig = async (configValue: number) => {
        const chrc = await $service!.getCharacteristic(brUuid[7]);
        await chrc.writeValue(new Uint8Array([configValue]));
    };

    const setDefaultConfig = async () => {
        await setConfig(cfg_cmd_set_default_cfg);
    };

    const setGameIdConfig = async () => {
        await setConfig(cfg_cmd_set_gameid_cfg);
    };

    const onChange = async () => {
        if(value === 'gameid') {
            await setGameIdConfig();
        } else {
            await setDefaultConfig();
        }

        const configCource = await getConfigSource();


    }

    // $: {
    //     if(value === 'gameid') {
    //         await setGameIdConfig(brService)
    //     .then(_ => {
    //         return 
    //     })
    //     .then(value => {
    //         current_cfg = value;
    //         initCfgSelection();
    //     })
    //     } else {

    //     }

    //     await getConfigSource(brService);
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
        <RadioItem bind:group={value} on:change={onChange} name="justify" value={'global'}>Global</RadioItem>
        <RadioItem bind:group={value} on:change={onChange} name="justify" value={'gameid'}>Game ID</RadioItem>
    </RadioGroup>
    <p class="text-sm">Start the game you wish to configure button mappings for, disconnect all controllers from BlueRetro, and press the Game ID button</p>
</div>
