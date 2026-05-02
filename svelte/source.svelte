<script lang="ts">
  import { writable } from 'svelte/store'

  export let label: string

  const count = writable(0)

  $: doubled = $count * 2
</script>

<p>{label}: {doubled}</p>
