# Demo: different source used in linting and typecheck for embedded frameworks

According to https://github.com/oxc-project/oxc/discussions/21936#discussioncomment-16754931, this repo is used to explore and verify the internal AST differences in embedded syntax frameworks

`Vue` and `Svelte` are used as primary examples.

We can use these following commands:

`just vue`: Show Vue's typecheck and linting result on the same file.
`just v-vue`: Generate virtual files / AST which are actually used in `vue-tsc` and `eslint-plugin-vue` (`vue-eslint-parser`)

`just svelte`: Show Svelte's typecheck and linting result on the same file.
`just v-svelte`: Generate virtual files / AST which are actually used in `svelte-check` and `eslint-plugin-svelte` (`svelte-eslint-parser`)

### Vue side

Both tools report `b` is undefined, but `vue-tsc` treat as a field of an object, while `eslint` treat as a variable.

If we look into `output/eslint.js`, we can find vue directly use `a` and `b` (IdentifierReference).

But in the `output/virtual.ts` (Typechecker), we can find the virtual file use `__VLS_ctx.a` and `__VLS_ctx.b`.
