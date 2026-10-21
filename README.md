# Vite+ drops Vike's Promise plugin metadata

Minimal reproduction of [vite-plus#3152](https://github.com/voidzero-dev/vite-plus/issues/3152).

`vike()` returns a Promise with its own `_vikeVitePluginOptions` property.
`defineConfig` from `vite-plus@1.3.0` replaces that Promise and loses the property.
Vike cannot find its plugin in the raw config, adds another instance, and fails during the build.

## Reproduce

Use Node.js 22.18.0 and pnpm 10.34.7 (both versions are pinned in this repository).

```sh
git clone https://github.com/why-reproductions-are-required/vite-plus-vike-promise-plugin-3152.git
cd vite-plus-vike-promise-plugin-3152
pnpm install --frozen-lockfile
pnpm build
```

The relevant config is:

```ts
import { defineConfig } from 'vite-plus';
import vike from 'vike/plugin';

export default defineConfig({ plugins: [vike()] });
```

On `main`, the build exits with code 1. Its output includes:

```text
[vike][Warning] Omitting Vike's Vite plugin (inside your vite.config.js) is deprecated
Error during build:
Error: [@brillout/vite-plugin-server-entry@0.7.23][Bug]
    at resolveConfig (.../@brillout/vite-plugin-server-entry/dist/esm/plugin/index.js:188:9)
```

The excerpt omits timestamps, the error's explanatory text, and absolute paths.

## Control and regression check

```sh
pnpm build:control
pnpm test
```

`build:control` uses the same page and an otherwise identical config that imports
`defineConfig` from `vite`. It calls Vike's build API to select that config file.
The client and server builds succeed.

`pnpm test` checks the Promise's own marker property before and after each
`defineConfig` call. The Vite case passes; the Vite+ case fails with
`defineConfig must preserve the own marker property`.
The assertions describe the expected correct behavior and should pass with a fixed version.

| Command | Result with `vite-plus@1.3.0` |
| --- | --- |
| `pnpm build` | Fails with the reported Vike warning and `resolveConfig` error |
| `pnpm build:control` | Passes |
| `pnpm test` | Vite passes; Vite+ fails |

The GitHub Actions workflow runs all three checks. Its failure on `main` is expected.

## Dependencies

- `vite-plus`: `1.3.0`
- `vite`: `npm:@voidzero-dev/vite-plus-core@1.3.0`
- `vike`: `0.4.268`

The `vite` override makes both cases use the same Vite+ core package.
The lockfile pins transitive dependencies. No React, Vue, or Vike UI extension is needed.

The proposed fix is [vite-plus#3154](https://github.com/voidzero-dev/vite-plus/pull/3154).
