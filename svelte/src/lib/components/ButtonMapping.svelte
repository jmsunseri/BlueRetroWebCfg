<script lang="ts">
	import { RangeSlider } from '@skeletonlabs/skeleton';
	import {
		btnList,
		maxOutput,
		maxMax,
		maxThres,
		turboMask,
		scaling as scalingOptions,
		diagScaling
	} from '../../../../utils/constants';
	import ChevronDown from '@tabler/icons-svelte/IconChevronDown.svelte';
	import ChevronUp from '@tabler/icons-svelte/IconChevronUp.svelte';
	import { IconX } from '@tabler/icons-svelte';

	const turboOptions: { [key: string]: number } = turboMask;

	export let sourceSystem: number;
	export let destinationSystem: number;
    export let onRemoveClicked: (index: number) => void;
    export let index: number;

	export let source: number | undefined = undefined;
	export let destination: number | undefined = undefined;
	export let destinationId: number | undefined = undefined;
	export let max: number = 100;
	export let threshold: number = 50;
	export let deadzone: number = 135;
	export let turbo: number | undefined = undefined;
	export let scaling: number | undefined = undefined;
	export let diagonal: number | undefined = undefined;

	let isShowingMore = false;

	const toggleShowMore = () => {
		isShowingMore = !isShowingMore;
	};
</script>

<div class="border-token rounded-token border-primary-500 flex flex-col gap-4 ">
    <div class="flex flex-row flex-start gap-4">
        <div class="flex flex-col gap-4 pl-4 pt-4" >
            <div class="flex flex-col gap-4 md:flex-row">
                <label class="label">
                    <span>Source</span>
                    <select class="select" bind:value={source}>
                        {#each btnList as button, i}
                            <option value={i}>{button[sourceSystem]}</option>
                        {/each}
                    </select>
                </label>
        
                <label class="label">
                    <span>Destination</span>
                    <select class="select" bind:value={destination}>
                        {#each btnList as button, i}
                            <option value={i}>{button[destinationSystem]}</option>
                        {/each}
                    </select>
                </label>
        
                <label class="label">
                    <span>Destination ID</span>
                    <select class="select" bind:value={destinationId}>
                        {#each { length: maxOutput } as _, i}
                            <option value={i}>{i + 1}</option>
                        {/each}
                    </select>
                </label>
            </div>
            {#if isShowingMore}
                <RangeSlider name="range-slider" bind:value={max} max={maxMax} step={5} ticked>
                    <div class="flex justify-between items-center">
                        <div class="font-bold">Max</div>
                        <div class="text-xs">{max} / {maxMax}</div>
                    </div>
                </RangeSlider>
                <RangeSlider name="range-slider" bind:value={threshold} max={maxThres} step={5} ticked>
                    <div class="flex justify-between items-center">
                        <div class="font-bold">Threshold</div>
                        <div class="text-xs">{threshold} / {maxThres}</div>
                    </div>
                </RangeSlider>
                <RangeSlider name="range-slider" bind:value={deadzone} max={maxMax} step={5} ticked>
                    <div class="flex justify-between items-center">
                        <div class="font-bold">Deadzone</div>
                        <div class="text-xs">{max / 1000}% / {maxMax / 1000}%</div>
                    </div>
                </RangeSlider>
                <div class="flex flex-col gap-4 md:flex-row">
                    <label class="label">
                        <span>Turbo</span>
                        <select class="select" bind:value={turbo}>
                            {#each Object.keys(turboOptions) as turboOption}
                                <option value={turboOptions[turboOption]}>{turboOption}</option>
                            {/each}
                        </select>
                    </label>
                    <label class="label">
                        <span>Scaling</span>
                        <select class="select" bind:value={scaling}>
                            {#each scalingOptions as scalingOption, i}
                                <option value={i}>{scalingOption}</option>
                            {/each}
                        </select>
                    </label>
                    <label class="label">
                        <span>Diagonal Scaling</span>
                        <select class="select" bind:value={diagonal}>
                            {#each diagScaling as scalingOption, i}
                                <option value={i}>{scalingOption}</option>
                            {/each}
                        </select>
                    </label>
                </div>
            {/if}
        </div>
        
        <div>
            <button type="button" class="btn-icon" on:click={() => onRemoveClicked(index)}>
                <IconX />
            </button>
        </div>
    </div>
	
	<div class="flex flex-row justify-center">
		<button class="btn btn-sm" on:click={toggleShowMore}>
			Show {isShowingMore ? 'Less' : 'More'}
			{#if isShowingMore}
				<ChevronUp />
			{:else}
				<ChevronDown />
			{/if}
		</button>
	</div>
</div>
