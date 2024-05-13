<script lang="ts">
	import { page } from '$app/stores';
	import { getDrawerStore } from '@skeletonlabs/skeleton';

	const drawerStore = getDrawerStore();

	$: classesActive = (href: string) =>
		href === $page.url.pathname ? '!variant-filled-primary' : '';
	const onItemSelect = () => {
		drawerStore.close();
	};
</script>

<nav class="list-nav">
	<ul>
		<p class="font-bold pl-4 text-xl">Controller</p>
		<li>
			<a
				on:click={onItemSelect}
				class={classesActive('/controller/global')}
				href="/controller/global">Global</a
			>
		</li>
		<li>
			<a
				on:click={onItemSelect}
				class={classesActive('/controller/output')}
				href="/controller/output">Output</a
			>
		</li>
		<li>
			<a on:click={onItemSelect} class={classesActive('/controller/n64')} href="/controller/n64"
				>N64 Controller Pack</a
			>
		</li>
		<li>
			<p class="font-bold pl-4">Button Mappings</p>
			<ul class="pl-4">
				<li>
					<a
						on:click={onItemSelect}
						class={classesActive('/controller/presets')}
						href="/controller/presets">Presets</a
					>
				</li>
				<li>
					<a
						on:click={onItemSelect}
						class={classesActive('/controller/buttons')}
						href="/controller/buttons">Custom</a
					>
				</li>
			</ul>
		</li>

		<p class="font-bold pl-4 text-xl">System</p>
		<li>
			<a on:click={onItemSelect} class={classesActive('/system/info')} href="/system/info"
				>Information</a
			>
		</li>
		<li>
			<a on:click={onItemSelect} class={classesActive('/system/files')} href="/system/files"
				>Files</a
			>
		</li>
		<li>
			<a on:click={onItemSelect} class={classesActive('/system/manage')} href="/system/manage"
				>Manage</a
			>
		</li>
		<li>
			<a on:click={onItemSelect} class={classesActive('/system/update')} href="/system/update"
				>Update</a
			>
		</li>
	</ul>
</nav>
