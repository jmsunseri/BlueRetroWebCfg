<script lang="ts">
	import { onMount } from 'svelte';
	import { urlLatestRelease } from '../../../../../utils/constants';
	import { deviceConfig } from '$lib/stores';

	let latestVersion: string | undefined;

	onMount(async () => {
		const response = await fetch(urlLatestRelease);
		const json = await response.json();
		latestVersion = json.tag_name;
	});

	$: upgradeAvailable = latestVersion && $deviceConfig?.appVersion?.indexOf(latestVersion) == -1;
</script>

<p>
	Latest Verison: {latestVersion} available at
	<a class="anchor" href="https://darthcloud.itch.io/blueretro">itch.io</a>
</p>
