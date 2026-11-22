import { Pool as NeonPool, neon } from '@neondatabase/serverless';
import { drizzle as drizzleNeonPool } from 'drizzle-orm/neon-serverless';
import { drizzle as drizzleNeonHttp } from 'drizzle-orm/neon-http';
import { drizzle as drizzlePg } from 'drizzle-orm/node-postgres';
import { Pool as PgPool } from 'pg';
import * as schema from './schema';

// Ensure pooled Neon connection string (appends -pooler if missing)
function getPooledConnectionString(rawUrl: string): string {
  if (rawUrl && rawUrl.includes('neon.tech') && !rawUrl.includes('-pooler')) {
    const parts = rawUrl.split('@');
    if (parts.length === 2) {
      const hostPart = parts[1];
      const hostMatch = hostPart.match(/^([a-z0-9-]+)(\.[a-z0-9.-]+\.neon\.tech.*)$/i);
      if (hostMatch) {
        return `${parts[0]}@${hostMatch[1]}-pooler${hostMatch[2]}`;
      }
    }
  }
  return rawUrl;
}

function getEffectiveDbConfig() {
  const rawDatabaseUrl =
    process.env.DATABASE_URL || 'postgres://postgres:postgres@localhost:5432/thegirlscollections';
  const databaseUrl = getPooledConnectionString(rawDatabaseUrl);
  const isNeon = databaseUrl.includes('neon.tech');
  return { databaseUrl, isNeon };
}

// Development isolation guard: prevent local dev/testing from exhausting production Neon egress
function checkDevIsolationGuard(databaseUrl: string) {
  if (
    process.env.NODE_ENV === 'development' &&
    databaseUrl.includes('ep-purple-firefly-azcc4gbe')
  ) {
    throw new Error(
      '[Neon Guard] BLOCKED: Local development attempted to connect to the production Neon database. ' +
        'To prevent egress depletion, configure a dedicated Neon development branch in .env.local.'
    );
  }
}

// Lazy connection instances — NEVER connect at module scope
let _pool: NeonPool | PgPool | null = null;
let _db: any = null;
let _dbHttp: any = null;

export function getDb() {
  if (!_db) {
    const { databaseUrl, isNeon } = getEffectiveDbConfig();
    checkDevIsolationGuard(databaseUrl);
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
    const { databaseUrl, isNeon } = getEffectiveDbConfig();
    checkDevIsolationGuard(databaseUrl);
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
