import assert from 'node:assert/strict';
import { test } from 'node:test';
import { defineConfig as defineViteConfig } from 'vite';
import { defineConfig as defineVitePlusConfig } from 'vite-plus';
import vike from 'vike/plugin';

for (const [name, defineConfig] of [
  ['vite (control)', defineViteConfig],
  ['vite-plus', defineVitePlusConfig],
]) {
  test(`${name} preserves Vike's Promise plugin metadata`, async () => {
    const plugin = vike();
    const marker = '_vikeVitePluginOptions';
    assert.ok(plugin instanceof Promise);
    assert.ok(Object.hasOwn(plugin, marker), 'Vike puts its marker on the Promise');

    const config = defineConfig({ plugins: [plugin] });
    const wrapped = config.plugins.find((entry) => entry instanceof Promise);
    assert.ok(wrapped, 'The config contains the Promise plugin');
    await wrapped;
    assert.ok(Object.hasOwn(wrapped, marker), 'defineConfig must preserve the own marker property');
    assert.strictEqual(wrapped[marker], plugin[marker]);
  });
}
