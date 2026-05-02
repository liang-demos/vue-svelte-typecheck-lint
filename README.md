According to https://github.com/oxc-project/oxc/discussions/21936#discussioncomment-16754931, this repo is used to explore and verify the internal AST differences in embedded syntax frameworks

`Vue` and `Svelte` are used as primary examples.

We can use these following commands:

`just vue`: Show Vue's typecheck and linting result on the same file.
`just v-vue`: Generate virtual files / AST which are actually used in `vue-tsc` and `eslint-plugin-vue` (`vue-eslint-parser`)

`just svelte`: Show Svelte's typecheck and linting result on the same file.
`just v-svelte`: Generate virtual files / AST which are actually used in `svelte-check` and `eslint-plugin-svelte` (`svelte-eslint-parser`)
