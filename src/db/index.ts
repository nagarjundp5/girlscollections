import { Pool as NeonPool, neon } from '@neondatabase/serverless';
import { drizzle as drizzleNeonPool } from 'drizzle-orm/neon-serverless';
import { drizzle as drizzleNeonHttp } from 'drizzle-orm/neon-http';
import { drizzle as drizzlePg } from 'drizzle-orm/node-postgres';
import { Pool as PgPool } from 'pg';
import * as schema from './schema';

const databaseUrl =
  process.env.DATABASE_URL || 'postgres://postgres:postgres@localhost:5432/thegirlscollections';
const isNeon = databaseUrl.includes('neon.tech');

// Lazy connection instances — NEVER connect at module scope
let _pool: NeonPool | PgPool | null = null;
let _db: any = null;
let _dbHttp: any = null;

export function getDb() {
  if (!_db) {
    if (isNeon) {
      _pool = new NeonPool({ connectionString: databaseUrl });
      _db = drizzleNeonPool(_pool as NeonPool, { schema });
    } else {
      _pool = new PgPool({ connectionString: databaseUrl });
      _db = drizzlePg(_pool as PgPool, { schema }) as any;
    }
  }
  return _db;
}

export function getDbHttp() {
  if (!_dbHttp) {
    _dbHttp = isNeon ? drizzleNeonHttp(neon(databaseUrl), { schema }) : getDb();
  }
  return _dbHttp;
}

// Proxies for backwards compatibility with zero connections at module evaluation
export const db: any = new Proxy({} as any, {
  get(_target, prop) {
    const client = getDb();
    const val = client[prop];
    return typeof val === 'function' ? val.bind(client) : val;
  },
});

export const dbHttp: any = new Proxy({} as any, {
  get(_target, prop) {
    const client = getDbHttp();
    const val = client[prop];
    return typeof val === 'function' ? val.bind(client) : val;
  },
});

export type DbClient = typeof db;
