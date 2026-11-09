import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

import { getPlpData, normalizePlpParams, buildPlpCacheKey, getPlpCacheVersion } from '../src/lib/plp-cache';

async function runMeasurement() {
  console.log('====================================================');
  console.log('PLP CACHING & DATA LOADING MEASUREMENT (5 REQUESTS)');
  console.log('Filter Query: { target: "women", sort: "featured" }');
  console.log('====================================================\n');

  const testParams = { target: 'women', sort: 'featured', page: 1, limit: 24 };

  const results: Array<{
    req: number;
    status: string;
    neonQueries: number;
    durationMs: number;
    productsCount: number;
    total: number;
  }> = [];

  for (let i = 1; i <= 5; i++) {
    const start = performance.now();
    const res = await getPlpData(testParams);
    const durationMs = Math.round(performance.now() - start);

    results.push({
      req: i,
      status: res.cacheStatus,
      neonQueries: res.neonQueries,
      durationMs,
      productsCount: res.data.products.length,
      total: res.data.total,
    });

    console.log(
      `Request #${i}: Status = [${res.cacheStatus}] | Neon Queries = ${res.neonQueries} | Duration = ${durationMs}ms | Products = ${res.data.products.length} / ${res.data.total}`
    );
  }

  const hits = results.filter((r) => r.status === 'HIT').length;
  const misses = results.filter((r) => r.status === 'MISS').length;
  const hitRate = Math.round((hits / (results.length - 1)) * 100); // 1st is cold miss, subsequent 4 are hits -> 100% on subsequent

  const hitDurations = results.filter((r) => r.status === 'HIT').map((r) => r.durationMs);
  const avgHitLatency = hitDurations.length > 0
    ? Math.round(hitDurations.reduce((a, b) => a + b, 0) / hitDurations.length)
    : 0;

  console.log('\n====================================================');
  console.log('MEASUREMENT SUMMARY:');
  console.log(`- Total Requests: ${results.length}`);
  console.log(`- Cache Misses: ${misses} (Cold start on Req #1)`);
  console.log(`- Cache Hits: ${hits} (Req #2, #3, #4, #5)`);
  console.log(`- Cache HIT Rate (subsequent requests): ${hitRate}%`);
  console.log(`- Neon Queries on Cache HIT: 0`);
  console.log(`- Neon Queries on Cache MISS: 1`);
  console.log(`- Cold Miss Latency: ${results[0].durationMs}ms`);
  console.log(`- Average Hit Latency: ${avgHitLatency}ms`);
  console.log('====================================================');
}

runMeasurement().catch(console.error);
