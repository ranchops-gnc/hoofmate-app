import assert from 'node:assert/strict';
import { once } from 'node:events';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import test from 'node:test';
import { createRegistryServer, openRegistry } from '../registry/server.js';

test('development registry stores each species and preserves records after reopening', async (t) => {
  const dir = await mkdtemp(join(tmpdir(), 'hoofmate-test-'));
  t.after(() => rm(dir, { recursive: true, force: true }));
  const filename = join(dir, 'registry.sqlite');
  const database = openRegistry(filename);
  const server = createRegistryServer(database);
  server.listen(0, '127.0.0.1');
  try {
    await once(server, 'listening');
    const base = `http://127.0.0.1:${server.address().port}`;
    const postAnimal = (animal) => fetch(`${base}/api/animals`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(animal),
    });
    assert.equal((await fetch(`${base}/healthz`)).status, 200);
    assert.match(await (await fetch(base)).text(), /Animal registry/);
    assert.match(await (await fetch(`${base}/mock/`)).text(), /Log a ride/);

    for (const animal of [
      { species: 'horse', name: 'Leoti' },
      { species: 'goat', name: '  Clover  ', breed: 'Boer' },
      { species: 'sheep', identification: 'E-17' },
    ]) {
      const response = await postAnimal(animal);
      assert.equal(response.status, 201);
      assert.equal((await response.json()).name, animal.name?.trim() ?? '');
    }

    assert.equal((await postAnimal({ species: 'cattle', name: 'Future' })).status, 422);
    assert.equal((await postAnimal({ species: 'sheep', name: '  ' })).status, 422);
    const { animals, species } = await (await fetch(`${base}/api/animals`)).json();
    assert.deepEqual(species, ['horse', 'goat', 'sheep']);
    assert.equal(animals.length, 3);
    assert.equal(new Set(animals.map(({ id }) => id)).size, 3);
  } finally {
    await new Promise((resolve) => server.close(resolve));
    database.close();
  }
  const reopened = openRegistry(filename);
  try {
    assert.equal(reopened.prepare('SELECT count(*) AS total FROM animals').get().total, 3);
    assert.equal(reopened.prepare('PRAGMA user_version').get().user_version, 1);
  } finally {
    reopened.close();
  }
});
