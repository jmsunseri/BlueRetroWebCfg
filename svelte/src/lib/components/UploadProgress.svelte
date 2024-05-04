<script lang="ts">
	import { ProgressBar } from '@skeletonlabs/skeleton';
	import { IconSquareX } from '@tabler/icons-svelte';

	export let isDoingSomething = false;
	export let progress = 0;
	export let max = 100;
	export let onCancelClick: VoidFunction;
</script>

{#if isDoingSomething}
	<div class="flex flex-row gap-4 items-center">
		<ProgressBar value={progress} {max} />
		<button class="btn btn-icon text-error-500" on:click={onCancelClick}>
			<IconSquareX />
		</button>
	</div>
{/if}
