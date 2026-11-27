import { randomUUID } from 'node:crypto';
import { mkdirSync } from 'node:fs';
import { readFile } from 'node:fs/promises';
import { createServer } from 'node:http';
import { dirname } from 'node:path';
import { DatabaseSync } from 'node:sqlite';

const species = ['horse', 'goat', 'sheep'];
const pages = new Map([
  ['/', ['./index.html', 'text/html']],
  ['/registry/client.js', ['./client.js', 'text/javascript']],
  ['/mock/', ['../mock/index.html', 'text/html']],
  ['/mock/app.js', ['../mock/app.js', 'text/javascript']],
  ['/mock/styles.css', ['../mock/styles.css', 'text/css']],
]);

export function openRegistry(filename) {
  if (filename !== ':memory:') mkdirSync(dirname(filename), { recursive: true });
  const database = new DatabaseSync(filename);
  database.exec('PRAGMA busy_timeout = 5000; BEGIN IMMEDIATE;');
  try {
    const { user_version: version } = database.prepare('PRAGMA user_version').get();
    if (version > 1) throw new Error('Database schema is newer than this app.');
    if (version === 0) {
      database.exec(`
        CREATE TABLE animals (
          id TEXT PRIMARY KEY,
          species TEXT NOT NULL,
          name TEXT NOT NULL,
          identification TEXT NOT NULL,
          breed TEXT NOT NULL
        ) STRICT;
        PRAGMA user_version = 1;
      `);
    }
    database.exec('COMMIT');
    return database;
  } catch (error) {
    database.exec('ROLLBACK');
    database.close();
    throw error;
  }
}

function normalizeAnimal(input) {
  if (!input || !species.includes(input.species)) return null;
  const animal = { species: input.species };
  for (const field of ['name', 'identification', 'breed']) {
    const value = input[field] ?? '';
    if (typeof value !== 'string' || value.trim().length > 100) return null;
    animal[field] = value.trim();
  }
  return animal.name || animal.identification ? animal : null;
}

function json(response, status, body) {
  response.writeHead(status, { 'content-type': 'application/json', 'cache-control': 'no-store' });
  response.end(JSON.stringify(body));
}

export function createRegistryServer(database) {
  const list = database.prepare('SELECT * FROM animals ORDER BY name COLLATE NOCASE, identification, id');
  const insert = database.prepare('INSERT INTO animals VALUES (?, ?, ?, ?, ?)');
  return createServer(async (request, response) => {
    const { method, url } = request;
    try {
      if (method === 'GET' && url === '/healthz') {
        database.prepare('SELECT 1 FROM animals LIMIT 1').get();
        return json(response, 200, { status: 'ok' });
      }
      if (method === 'GET' && url === '/api/animals') {
        return json(response, 200, { species, animals: list.all() });
      }
      if (method === 'POST' && url === '/api/animals') {
        if (request.headers['content-type'] !== 'application/json') {
          return json(response, 415, { error: 'Send animal records as JSON.' });
        }
        const chunks = [];
        let size = 0;
        for await (const chunk of request) {
          size += chunk.length;
          if (size > 8192) {
            response.setHeader('connection', 'close');
            return json(response, 413, { error: 'Animal record is too large.' });
          }
          chunks.push(chunk);
        }
        let animal;
        try {
          animal = normalizeAnimal(JSON.parse(Buffer.concat(chunks).toString('utf8')));
        } catch {
          return json(response, 400, { error: 'Invalid JSON.' });
        }
        if (!animal) {
          return json(response, 422, { error: 'Choose a species and enter a name or ID. Each field can have up to 100 characters.' });
        }
        const id = randomUUID();
        insert.run(id, animal.species, animal.name, animal.identification, animal.breed);
        return json(response, 201, { id, ...animal });
      }
      const page = pages.get(url);
      if (method === 'GET' && page) {
        const [path, type] = page;
        const content = await readFile(new URL(path, import.meta.url));
        response.writeHead(200, { 'content-type': `${type}; charset=utf-8` });
        return response.end(content);
      }
      return json(response, 404, { error: 'Page not found.' });
    } catch {
      return json(response, 500, { error: 'HoofMate could not complete the request.' });
    }
  });
}

if (import.meta.main) {
  const database = openRegistry(process.env.HOOFMATE_DEV_DB ?? '.hoofmate-dev/registry.sqlite');
  const port = Number(process.env.PORT ?? 4173);
  const host = process.env.HOST ?? '127.0.0.1';
  createRegistryServer(database).listen(port, host, () => {
    console.log(`HoofMate development server listening on ${host}:${port}`);
  });
}
