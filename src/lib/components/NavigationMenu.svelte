<script lang="ts">
	import { base } from '$app/paths';
	import { page } from '$app/state';

	interface Props {
		onItemSelect?: VoidFunction;
	}

	let classesActive = $derived((href: string) =>
		href === page.url.pathname ? '!preset-filled-primary-500' : '');
	
	let { onItemSelect = $bindable() }: Props = $props();
</script>

<nav class="list-nav">
	<ul>
		<p class="font-bold text-xl">Controller</p>
		<li class="pl-4">
			<a
				onclick={onItemSelect}
				class={classesActive('/controller/global')}
				href="{base}/controller/global">Global</a
			>
		</li>
		<li class="pl-4">
			<a
				onclick={onItemSelect}
				class={classesActive('/controller/output')}
				href="{base}/controller/output">Output</a
			>
		</li>
		<li class="pl-4">
			<a onclick={onItemSelect} class={classesActive('/controller/n64')} href="{base}/controller/n64"
				>N64 Controller Pack</a
			>
		</li>
		<li>
			<p class="font-bold text-xl">Button Mappings</p>
			<ul class="pl-4">
				<li>
					<a
						onclick={onItemSelect}
						class={classesActive('/controller/presets')}
						href="{base}/controller/presets">Presets</a
					>
				</li>
				<li>
					<a
						onclick={onItemSelect}
						class={classesActive('/controller/buttons')}
						href="{base}/controller/buttons">Custom</a
					>
				</li>
			</ul>
		</li>

		<p class="font-bold text-xl">System</p>
		<li class="pl-4">
			<a onclick={onItemSelect} class={classesActive('/system/files')} href="{base}/system/files"
				>Files</a
			>
		</li>
		<li class="pl-4">
			<a onclick={onItemSelect} class={classesActive('/system/manage')} href="{base}/system/manage"
				>Manage</a
			>
		</li>
		<li class="pl-4">
			<a onclick={onItemSelect} class={classesActive('/system/update')} href="{base}/system/update"
				>Update</a
			>
		</li>
	</ul>
</nav>
