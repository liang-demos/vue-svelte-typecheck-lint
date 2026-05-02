<script lang="ts">
  import { writable } from 'svelte/store';
  const user = writable({ name: 'liang' });
</script>

<p>{$user.age}</p>
<p>{missing}</p>
