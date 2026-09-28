import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import pg from 'pg';
import { PGlite } from '@electric-sql/pglite';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export interface QueryResult<T = any> {
  rows: T[];
  rowCount: number;
}

let pgPool: pg.Pool | null = null;
let pgliteInstance: PGlite | null = null;
let isPgLite = false;

export async function getDbClient() {
  if (pgPool) {
    return { type: 'pg', client: pgPool };
  }
  if (pgliteInstance) {
    return { type: 'pglite', client: pgliteInstance };
  }

  const databaseUrl = process.env.DATABASE_URL?.trim();

  if (databaseUrl) {
    try {
      console.log('Connecting to PostgreSQL using DATABASE_URL...');
      const pool = new pg.Pool({
        connectionString: databaseUrl,
        ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : undefined,
      });

      // Test connection
      await pool.query('SELECT 1');
      console.log('Successfully connected to external PostgreSQL database.');
      pgPool = pool;
      return { type: 'pg', client: pgPool };
    } catch (err) {
      console.warn('Failed to connect to PostgreSQL at DATABASE_URL, falling back to embedded PGlite:', (err as Error).message);
    }
  }

  // Use embedded in-memory PostgreSQL (PGlite) for flawless cross-platform execution
  console.log('Using embedded PostgreSQL (PGlite)...');
  pgliteInstance = new PGlite();
  await pgliteInstance.waitReady;
  isPgLite = true;
  console.log('PGlite embedded PostgreSQL engine is ready.');
  return { type: 'pglite', client: pgliteInstance };
}

export async function query<T = any>(text: string, params?: any[]): Promise<QueryResult<T>> {
  const { type, client } = await getDbClient();

  if (type === 'pg') {
    const res = await (client as pg.Pool).query(text, params);
    return {
      rows: res.rows as T[],
      rowCount: res.rowCount ?? res.rows.length,
    };
  } else {
    const pglite = client as PGlite;
    const res = await pglite.query<T>(text, params);
    return {
      rows: res.rows,
      rowCount: res.rows.length,
    };
  }
}

export async function initDb(): Promise<void> {
  console.log('Initializing database schema and seed data...');
  const { type, client } = await getDbClient();

  // Check if tables already exist
  const checkQuery = `
    SELECT EXISTS (
      SELECT FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name = 'medicines'
    );
  `;
  const checkRes = await query<{ exists: boolean }>(checkQuery);
  const tablesExist = checkRes.rows[0]?.exists;

  const schemaPath = path.resolve(__dirname, '../../../database/schema.sql');
  const seedPath = path.resolve(__dirname, '../../../database/seed.sql');

  if (!tablesExist) {
    console.log('Creating database schema from schema.sql...');
    let schemaSql = fs.readFileSync(schemaPath, 'utf8');

    // If using PGlite, ensure pgcrypto is handled or uuid-ossp fallback
    if (type === 'pglite') {
      await (client as PGlite).exec(schemaSql);
    } else {
      await (client as pg.Pool).query(schemaSql);
    }

    console.log('Populating seed data from seed.sql...');
    const seedSql = fs.readFileSync(seedPath, 'utf8');
    if (type === 'pglite') {
      await (client as PGlite).exec(seedSql);
    } else {
      await (client as pg.Pool).query(seedSql);
    }
    console.log('Database initialization complete.');
  } else {
    // Check if medicines table has rows
    const countRes = await query<{ count: string }>('SELECT COUNT(*) FROM medicines');
    if (parseInt(countRes.rows[0]?.count || '0', 10) === 0) {
      console.log('Medicines table empty, seeding data...');
      const seedSql = fs.readFileSync(seedPath, 'utf8');
      if (type === 'pglite') {
        await (client as PGlite).exec(seedSql);
      } else {
        await (client as pg.Pool).query(seedSql);
      }
      console.log('Seed data inserted.');
    } else {
      console.log('Database already initialized with records.');
    }
  }
}

export async function closeDb(): Promise<void> {
  if (pgPool) {
    await pgPool.end();
    pgPool = null;
  }
  if (pgliteInstance) {
    await pgliteInstance.close();
    pgliteInstance = null;
  }
}
