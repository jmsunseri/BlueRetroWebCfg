
<div class="border-token rounded-token border-success-500 flex flex-start gap-4">
    <label class="label">
        <span>Source</span>
        <select class="select" bind:value={selectedSystem}>
            {#each systems as system, i}
                <option value={i}>{system}</option>
            {/each}
        </select>
    </label>

    <label class="label">
        <span>Destination</span>
        <select class="select" bind:value={selectedSystem}>
            {#each systems as system, i}
                <option value={i}>{system}</option>
            {/each}
        </select>
    </label>

    <label class="label">
        <span>Destination ID</span>
        <select class="select" bind:value={selectedSystem}>
            {#each systems as system, i}
                <option value={i}>{system}</option>
            {/each}
        </select>
    </label>

    <label class="label">
        <span>Max</span>
        <select class="select" bind:value={selectedSystem}>
            {#each systems as system, i}
                <option value={i}>{system}</option>
            {/each}
        </select>
    </label>
    <label class="label">
        <span>Threshold</span>
        <select class="select" bind:value={selectedSystem}>
            {#each systems as system, i}
                <option value={i}>{system}</option>
            {/each}
        </select>
    </label>
    <label class="label">
        <span>Deadzone</span>
        <select class="select" bind:value={selectedSystem}>
            {#each systems as system, i}
                <option value={i}>{system}</option>
            {/each}
        </select>
    </label>
    <label class="label">
        <span>Scaling</span>
        <select class="select" bind:value={selectedSystem}>
            {#each systems as system, i}
                <option value={i}>{system}</option>
            {/each}
        </select>
    </label>
    <label class="label">
        <span>Turbo</span>
        <select class="select" bind:value={selectedSystem}>
            {#each systems as system, i}
                <option value={i}>{system}</option>
            {/each}
        </select>
    </label>
    <label class="label">
        <span>Threshold</span>
        <select class="select" bind:value={selectedSystem}>
            {#each systems as system, i}
                <option value={i}>{system}</option>
            {/each}
        </select>
    </label>
    <label class="label">
        <span>Diagonal</span>
        <select class="select" bind:value={selectedSystem}>
            {#each systems as system, i}
                <option value={i}>{system}</option>
            {/each}
        </select>
    </label>
</div>


