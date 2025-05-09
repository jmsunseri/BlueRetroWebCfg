<script lang="ts">
	import { ProgressBar } from '@skeletonlabs/skeleton';
	import { IconSquareX } from '@tabler/icons-svelte';

	interface Props {
		isDoingSomething?: boolean;
		progress?: number;
		max?: number;
		onCancelClick: VoidFunction;
	}

	let {
		isDoingSomething = false,
		progress = 0,
		max = 100,
		onCancelClick
	}: Props = $props();
</script>

{#if isDoingSomething}
	<div class="flex flex-row gap-4 items-center">
		<ProgressBar value={progress} {max} />
		<button class="btn btn-icon text-error-500" onclick={onCancelClick}>
			<IconSquareX />
		</button>
	</div>
{/if}
