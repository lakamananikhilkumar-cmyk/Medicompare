import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { getDbClient, closeDb } from './index.js';
import type pg from 'pg';
import type { PGlite } from '@electric-sql/pglite';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function runSeed() {
  console.log('--- MediCompare Database Seeder ---');
  try {
    const { type, client } = await getDbClient();
    const schemaPath = path.resolve(__dirname, '../../../database/schema.sql');
    const seedPath = path.resolve(__dirname, '../../../database/seed.sql');

    console.log('Applying schema from:', schemaPath);
    const schemaSql = fs.readFileSync(schemaPath, 'utf8');
    if (type === 'pglite') {
      await (client as PGlite).exec(schemaSql);
    } else {
      await (client as pg.Pool).query(schemaSql);
    }

    console.log('Applying seed data from:', seedPath);
    const seedSql = fs.readFileSync(seedPath, 'utf8');
    if (type === 'pglite') {
      await (client as PGlite).exec(seedSql);
    } else {
      await (client as pg.Pool).query(seedSql);
    }

    console.log('Seeding completed successfully!');
  } catch (err) {
    console.error('Seeding failed:', err);
    process.exit(1);
  } finally {
    await closeDb();
  }
}

runSeed();
