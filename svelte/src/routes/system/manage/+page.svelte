<script lang="ts">
	import {
		brUuid,
		cfg_cmd_close_dir,
		cfg_cmd_del_file,
		cfg_cmd_get_file,
		cfg_cmd_open_dir
	} from '$lib/constants';
	import { getGameName, getService } from '$lib/utilities';
	import { device, deviceConfig, service } from '$lib/stores';
	import { IconTrash } from '@tabler/icons-svelte';
	import type { IBlueRetroFile } from '$lib/interfaces';

	const readFileRecursive = async (
		chrc: BluetoothRemoteGATTCharacteristic,
		files: IBlueRetroFile[]
	) => {
		const value = await chrc.readValue();
		if (value.byteLength > 0) {
			let enc = new TextDecoder('utf-8');
			let name = enc.decode(value);
			try {
				const gameName = (await getGameName(name))?.toString();
				files.push({ name, gameName });
			} catch {
				files.push({ name });
			}

			await readFileRecursive(chrc, files);
		}
		return files;
	};

	const deleteFileCmd = async (filename: string, service: BluetoothRemoteGATTService) => {
		var cmd = new Uint8Array([cfg_cmd_del_file]);
		const chrc = await service.getCharacteristic(brUuid[7]);
		let enc = new TextEncoder();
		let file = enc.encode(filename);
		let combined = new Uint8Array([...cmd, ...file]);
		await chrc.writeValue(combined);
	};

	const deleteFile = async (filename: string, index: number) => {
		if ($device) {
			const service = await getService($device);
			await deleteFileCmd(filename, service);
			deviceConfig.update((c) => ({
				...c,
				files: c?.files?.filter((_, i) => i !== index)
			}));
		}
	};

	const getFiles = async (service: BluetoothRemoteGATTService) => {
		var cmd = new Uint8Array([cfg_cmd_open_dir]);
		const cmd_chrc = await service.getCharacteristic(brUuid[7]);
		await cmd_chrc.writeValue(cmd);
		cmd[0] = cfg_cmd_get_file;
		await cmd_chrc.writeValue(cmd);
		const files = await readFileRecursive(cmd_chrc, []);
		cmd[0] = cfg_cmd_close_dir;
		await cmd_chrc.writeValue(cmd);
		deviceConfig.update((c) => ({
			...c,
			files
		}));
	};

	$: if (!!$service && !!$device && ($deviceConfig?.files?.length || 0) == 0) {
		getFiles($service);
	}
</script>

<ul class="list flex-col flex-none">
	{#if $device && $deviceConfig?.files?.length}
		{#each $deviceConfig.files as file, i}
			<li class="flex flex-row gap-4">
				<span class="flex-1">{file.gameName ?? file.name}</span>
				<button
					on:click={async () => await deleteFile(file.name, i)}
					class="btn-icon btn-icon-sm hover:variant-filled-error"
				>
					<IconTrash />
				</button>
			</li>
		{/each}
	{/if}
</ul>
