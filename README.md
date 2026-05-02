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

### Svelte side

Smaller in scope than Vue's, but the same class of divergence shows up around store auto-subscription (`$store`).

`source.svelte` declares a writable store `user` and references it two ways:

- `{$user.age}` — store-value property access (`age` doesn't exist on the value type)
- `{missing}` — undeclared bare identifier

Both reach the same position in the source, but each tool models them with a different AST shape:

- `output/virtual.ts` (svelte2tsx, what svelte-check feeds tsc) rewrites `$user` to `__sveltets_2_store_get(user)`, so `$user.age` becomes a real `MemberExpression` on the store-value type. The typechecker reports:
  - `Property 'age' does not exist on type '{ name: string; }'.` — **member-access diagnostic** on `$user.age`
  - `Cannot find name 'missing'.` — **identifier diagnostic** on `missing`
- `output/eslint.js` (svelte-eslint-parser script view) keeps script identifiers bare; the parser's scope manager resolves `$user` against the `user` binding. ESLint reports:
  - nothing on `$user.age` — `$user` is bound, `.age` is just a property access ESLint can't type-check
  - `'missing' is not defined` (`no-undef`) — same identifier the typechecker called "Cannot find name"

So at line 6, the typechecker emits a `Property X does not exist on type Y` diagnostic that ESLint cannot produce, because ESLint never sees the synthesized `__sveltets_2_store_get(user)` member access at all. This is the Svelte analog of Vue's `__VLS_ctx.b` vs raw `b` divergence.
