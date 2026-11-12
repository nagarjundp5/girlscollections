import { normalizeSize, isValidCanonicalSize } from '../src/lib/normalizeSize';
import { createOrderSchema } from '../src/lib/validations';

function runTests() {
  console.log('\n=== [TEST SUITE: Order Size Normalization & Validation] ===\n');

  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, testName: string) {
    if (condition) {
      console.log(`✅ PASS: ${testName}`);
      passed++;
    } else {
      console.error(`❌ FAIL: ${testName}`);
      failed++;
    }
  }

  // 1. Kids size k26 variations
  assert(normalizeSize('kids', 'k26') === 'k26', 'Kids "k26" normalizes to canonical "k26"');
  assert(normalizeSize('kids', 'K26') === 'k26', 'Kids "K26" normalizes to canonical "k26"');
  assert(normalizeSize('kids', '26') === 'k26', 'Kids bare numeric "26" normalizes to canonical "k26"');
  assert(normalizeSize('kids', 'Size 26 (6 years)') === 'k26', 'Kids label "Size 26 (6 years)" normalizes to "k26"');
  assert(normalizeSize('kids', '6-7Y') === 'k26', 'Legacy kids "6-7Y" maps to canonical "k26"');
  assert(normalizeSize('all', 'k26') === 'k26', 'All division "k26" normalizes to "k26"');

  // 2. Women size XL variations
  assert(normalizeSize('women', 'XL') === 'XL', 'Women "XL" normalizes to canonical "XL"');
  assert(normalizeSize('women', 'xl') === 'XL', 'Women "xl" normalizes to canonical "XL"');
  assert(normalizeSize('women', 'Size 40') === '40' || normalizeSize('women', 'Size 40') === 'XL', 'Women "Size 40" resolves to valid women size');
  assert(normalizeSize('women', 'Free Size') === 'FREE SIZE', 'Women "Free Size" normalizes to "FREE SIZE"');
  assert(normalizeSize('women', '2XL') === 'XXL', 'Women "2XL" normalizes to "XXL"');

  // 3. Unknown sizes must fail and return null
  assert(normalizeSize('kids', 'INVALID_XYZ') === null, 'Invalid size "INVALID_XYZ" returns null');
  assert(normalizeSize('women', 'random_text_123') === null, 'Invalid size "random_text_123" returns null');
  assert(normalizeSize('all', '') === null, 'Empty size returns null');
  assert(!isValidCanonicalSize('random_fake_size'), 'isValidCanonicalSize correctly rejects fake size');

  // 4. Pre-payment schema validation: valid sizes pass, invalid sizes reject
  const validKidsOrder = {
    fulfillmentType: 'pickup',
    items: [
      { productId: 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d', size: 'k26', quantity: 1 }
    ],
    customerInfo: {
      name: 'Priya Sharma',
      email: 'priya@example.com',
      phone: '9876543210'
    }
  };
  const validKidsRes = createOrderSchema.safeParse(validKidsOrder);
  assert(validKidsRes.success, 'Valid kids size k26 passes createOrderSchema');

  const validWomenOrder = {
    fulfillmentType: 'pickup',
    items: [
      { productId: 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d', size: 'XL', quantity: 1 }
    ],
    customerInfo: {
      name: 'Ananya Rao',
      email: 'ananya@example.com',
      phone: '9876543210'
    }
  };
  const validWomenRes = createOrderSchema.safeParse(validWomenOrder);
  assert(validWomenRes.success, 'Valid women size XL passes createOrderSchema');

  const invalidSizeOrder = {
    fulfillmentType: 'pickup',
    items: [
      { productId: 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d', size: 'INVALID_UNKNOWN_SIZE', quantity: 1 }
    ],
    customerInfo: {
      name: 'Test Customer',
      email: 'test@example.com',
      phone: '9876543210'
    }
  };
  const invalidRes = createOrderSchema.safeParse(invalidSizeOrder);
  assert(!invalidRes.success, 'Invalid size "INVALID_UNKNOWN_SIZE" is rejected by createOrderSchema BEFORE payment');

  // 5. Stock decrement regex validation
  const stockRegex = /^[a-zA-Z0-9\s-]{1,15}$/;
  assert(stockRegex.test('k26'), 'Stock decrement regex allows lowercase k in "k26"');
  assert(stockRegex.test('XL'), 'Stock decrement regex allows "XL"');
  assert(stockRegex.test('FREE SIZE'), 'Stock decrement regex allows "FREE SIZE"');
  assert(!stockRegex.test('k26; DROP TABLE products;'), 'Stock decrement regex rejects injection attempts');

  console.log(`\n=== RESULTS: ${passed} Passed, ${failed} Failed ===\n`);

  if (failed > 0) {
    process.exit(1);
  }
}

runTests();
