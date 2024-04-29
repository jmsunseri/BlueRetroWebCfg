<script>
	import { 
        maxMainInput,
        labelName as deviceLabels
    } from "../../../../../utils/constants";
</script>


<div class="flex md:flex-row flex-col gap-4">
    <label class="label">
        <span>Bluetooth Device #</span>
        <select class="select">
            {#each { length: maxMainInput } as _, i}
                <option value={i + 1}>{i + 1}</option>
            {/each}
        </select>
    </label>
    <label class="label">
        <span>Source</span>
        <select class="select">
            {#each deviceLabels as deviceLabel, i}
                <option value={i}>{deviceLabel}</option>
            {/each}
        </select>
    </label>
    
    <label class="label">
        <span>Destination</span>
        <select class="select">
            {#each deviceLabels as deviceLabel, i}
                <option value={i}>{deviceLabel}</option>
            {/each}
        </select>
    </label>
</div>   
