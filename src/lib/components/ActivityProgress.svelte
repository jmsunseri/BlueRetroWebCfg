<script lang="ts">
	import { Progress } from '@skeletonlabs/skeleton-svelte';
	import { IconSquareX } from '@tabler/icons-svelte';

	interface Props {
		isDoingSomething?: boolean;
		progress?: number;
		max?: number;
		onCancelClick: VoidFunction;
		labelText: string;
	}

	let {
		isDoingSomething = false,
		progress = 0,
		max = 100,
		onCancelClick,
		labelText
	}: Props = $props();
</script>

{#if isDoingSomething}
	<div class="flex flex-row gap-4 items-center">
		<Progress height="h-4" value={progress} {max} >{labelText}</Progress>
		<button class="btn btn-icon text-error-500" onclick={onCancelClick}>
			<IconSquareX />
		</button>
	</div>
{/if}
