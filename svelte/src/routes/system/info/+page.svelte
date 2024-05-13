<script lang="ts">
	import { deviceConfig, device } from '$lib/stores';
</script>

{#if $deviceConfig && $device}
	<p><span class="font-bold"> Device Name:</span> {$device?.name || '...'}</p>
	<p>
		<span class="font-bold">Installed Version:</span>
		{$deviceConfig?.appVersion || '...'}
	</p>
	<p>
		<span class="font-bold">Bluetooth Address:</span>
		{$deviceConfig?.bluetoothAddress || '...'}
	</p>
{:else}
	<p>You need to select a device before you can view any system information.</p>
{/if}
