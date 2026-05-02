vue:
    cd vue && pnpm exec vue-tsc --noEmit -p tsconfig.json; pnpm exec eslint source.vue

v-vue:
    cd vue && pnpm exec tsx generate.ts

svelte:
    cd svelte && pnpm exec svelte-check --tsconfig ./tsconfig.json; pnpm exec eslint source.svelte

v-svelte:
    cd svelte && pnpm exec tsx generate.ts
