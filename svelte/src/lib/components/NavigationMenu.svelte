<script lang="ts">
	import { page } from '$app/state';
	const drawerStore = getDrawerStore();

	let classesActive = $derived((href: string) =>
		href === page.url.pathname ? '!preset-filled-primary-500' : '');
	const onItemSelect = () => {
		drawerStore.close();
	};
</script>

<nav class="list-nav">
	<ul>
		<p class="font-bold pl-4 text-xl">Controller</p>
		<li>
			<a
				onclick={onItemSelect}
				class={classesActive('/controller/global')}
				href="/controller/global">Global</a
			>
		</li>
		<li>
			<a
				onclick={onItemSelect}
				class={classesActive('/controller/output')}
				href="/controller/output">Output</a
			>
		</li>
		<li>
			<a onclick={onItemSelect} class={classesActive('/controller/n64')} href="/controller/n64"
				>N64 Controller Pack</a
			>
		</li>
		<li>
			<p class="font-bold pl-4">Button Mappings</p>
			<ul class="pl-4">
				<li>
					<a
						onclick={onItemSelect}
						class={classesActive('/controller/presets')}
						href="/controller/presets">Presets</a
					>
				</li>
				<li>
					<a
						onclick={onItemSelect}
						class={classesActive('/controller/buttons')}
						href="/controller/buttons">Custom</a
					>
				</li>
			</ul>
		</li>

		<p class="font-bold pl-4 text-xl">System</p>
		<li>
			<a onclick={onItemSelect} class={classesActive('/system/info')} href="/system/info"
				>Information</a
			>
		</li>
		<li>
			<a onclick={onItemSelect} class={classesActive('/system/files')} href="/system/files"
				>Files</a
			>
		</li>
		<li>
			<a onclick={onItemSelect} class={classesActive('/system/manage')} href="/system/manage"
				>Manage</a
			>
		</li>
		<li>
			<a onclick={onItemSelect} class={classesActive('/system/update')} href="/system/update"
				>Update</a
			>
		</li>
	</ul>
</nav>
