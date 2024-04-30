<script lang="ts">
	import { FileButton } from "@skeletonlabs/skeleton";


    let pak = 0;

</script>


<div class="flex flex-col gap-4 p-4">
    <label class="label">
        <span>Select N64 Controller Pak</span>
        <select class="select" bind:value={pak}>
            {#each { length: 4 } as _, i}
                <option value={i}>Pak {i + 1}</option>
            {/each}
        </select>
    </label>
    
    <div class="flex flex-row gap-4 items-center">
        <button class="btn variant-ghost">Read</button>

        <button class="btn variant-ghost">Format</button>

        <button class="btn variant-ghost">Write</button>
        <p>Select .MPK file to write</p>

        <FileButton name="files" button="btn variant-ghost">Upload</FileButton>

        
    </div>
    <p>Use <a class="anchor" href="https://bryc.github.io/mempak">https://bryc.github.io/mempak</a> (by <a class="anchor" href="https://github.com/bryc" >bryc</a>) to manage content of .MPK files.</p>
</div>

