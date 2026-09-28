import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../../.env') });
dotenv.config();

import assert from 'assert';
import { query, initDb, closeDb } from '../src/db/index.js';
import { classifyPromptSafety, getMedicineInformation, getPriceComparisonExplanation } from '../src/services/aiService.js';
import { generateToken } from '../src/middleware/auth.js';
import { isSupabaseConfigured, getSupabaseClient } from '../src/services/supabaseService.js';

async function runTests() {
  console.log('--- Running MediCompare Integration & Logic Tests ---');

  try {
    await initDb();

    // 0. Verify Supabase Configuration
    console.log('[Test 0] Verifying Supabase Service Connection...');
    const supaReady = isSupabaseConfigured();
    console.log(`✓ Supabase configured: ${supaReady ? 'YES' : 'NO'}`);
    if (supaReady) {
      const supa = getSupabaseClient();
      assert.ok(supa, 'Supabase client instance should be defined');
    }

    // 1. Verify Database Records
    console.log('[Test 1] Verifying Database Seeding...');
    const medRes = await query('SELECT count(*) as count FROM medicines');
    assert(Number(medRes.rows[0].count) >= 15, 'Should have at least 15 medicines');

    const pharmRes = await query('SELECT count(*) as count FROM pharmacies');
    assert(Number(pharmRes.rows[0].count) >= 10, 'Should have at least 10 pharmacies');

    const invRes = await query('SELECT count(*) as count FROM pharmacy_inventory');
    assert(Number(invRes.rows[0].count) >= 40, 'Should have at least 40 inventory records');
    console.log('✓ Database records verified.');

    // 2. Exact Formulation Verification
    console.log('[Test 2] Exact formulation separation...');
    const p500 = await query("SELECT id, strength FROM medicines WHERE name LIKE '%Paracetamol 500%'");
    const p650 = await query("SELECT id, strength FROM medicines WHERE name LIKE '%Paracetamol 650%'");
    assert(p500.rows.length > 0 && p650.rows.length > 0, 'Both formulations must exist');
    assert(p500.rows[0].id !== p650.rows[0].id, 'Formulations must have distinct IDs');
    assert(p500.rows[0].strength === '500 mg' && p650.rows[0].strength === '650 mg');
    console.log('✓ Exact formulation identity verified.');

    // 3. Price Variance & Potential Savings Calculation
    console.log('[Test 3] Price variance calculation...');
    const paracetamolId = p500.rows[0].id;
    const invPrices = await query<{ price: string }>(
      'SELECT price FROM pharmacy_inventory WHERE medicine_id = $1',
      [paracetamolId]
    );
    const prices = invPrices.rows.map((r) => parseFloat(r.price));
    const lowest = Math.min(...prices);
    const highest = Math.max(...prices);
    const diff = highest - lowest;
    const pct = (diff / highest) * 100;
    assert(lowest > 0, 'Lowest price should be positive');
    assert(highest >= lowest, 'Highest should be >= lowest');
    assert(diff > 0, 'Should show price difference across pharmacies');
    console.log(`✓ Paracetamol 500 mg prices: min ₹${lowest}, max ₹${highest}, savings ₹${diff.toFixed(2)} (${pct.toFixed(1)}%)`);

    // 4. AI Safety Classification
    console.log('[Test 4] AI Safety Guardrails...');
    const safeQ = classifyPromptSafety('What is the difference between paracetamol and ibuprofen?');
    assert.strictEqual(safeQ.allowed, true, 'General question should be allowed');

    const diagQ = classifyPromptSafety('I have fever, cough and severe stomach pain, do I have COVID?');
    assert.strictEqual(diagQ.allowed, false, 'Diagnosis query must be rejected');
    assert.strictEqual(diagQ.category, 'diagnosis');

    const doseQ = classifyPromptSafety('Can I stop taking my blood pressure medicine and take double dose?');
    assert.strictEqual(doseQ.allowed, false, 'Medication change must be rejected');
    assert.strictEqual(doseQ.category, 'medication_change');

    const emergQ = classifyPromptSafety('Patient has severe chest pain and is unconscious');
    assert.strictEqual(emergQ.allowed, false, 'Emergency must be rejected');
    assert.strictEqual(emergQ.category, 'emergency');
    console.log('✓ AI safety classifier passed all scenarios.');

    // 5. AI Structured Output Conformance
    console.log('[Test 5] AI Structured Output Verification...');
    const medInfo = await getMedicineInformation({
      medicineName: 'Paracetamol',
      strength: '500 mg',
      dosageForm: 'Tablet',
    });
    assert.ok(medInfo.summary, 'Summary must be present');
    assert.ok(Array.isArray(medInfo.commonUses), 'commonUses must be an array');
    assert.ok(medInfo.safetyNotice.includes('MediCompare'), 'Disclaimer must be present');

    const compareExp = await getPriceComparisonExplanation({
      medicine: 'Paracetamol 500 mg Tablet',
      prices: [
        { pharmacy: 'Jan Aushadhi', price: 7.5 },
        { pharmacy: 'Apollo Pharmacy', price: 20.0 },
      ],
    });
    assert.strictEqual(compareExp.lowestPrice, 7.5);
    assert.strictEqual(compareExp.highestPrice, 20.0);
    assert.strictEqual(compareExp.absoluteDifference, 12.5);
    assert.ok(compareExp.explanation.length > 20);
    console.log('✓ AI structured output schemas validated.');

    // 6. Auth Token & Admin Role Handling
    console.log('[Test 6] JWT Token Generation...');
    const token = generateToken({
      id: 'aa000000-0000-0000-0000-000000000001',
      email: 'admin@medicompare.com',
      role: 'admin',
      name: 'System Administrator',
    });
    assert.ok(token && typeof token === 'string' && token.length > 20);
    console.log('✓ JWT Token generation verified.');

    console.log('\n>>> ALL BACKEND & DATABASE TESTS PASSED! <<<');
  } catch (err) {
    console.error('Test failure:', err);
    process.exit(1);
  } finally {
    await closeDb();
  }
}

runTests();
