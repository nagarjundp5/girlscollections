import { neon } from '@neondatabase/serverless';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  console.error('DATABASE_URL is missing in .env.local');
  process.exit(1);
}

const sql = neon(databaseUrl);

async function runMigration() {
  console.log('Running checkout flow DB migration on Neon...');

  // 1. Add fields to orders table
  await sql`
    ALTER TABLE orders
      ADD COLUMN IF NOT EXISTS payment_mode text,
      ADD COLUMN IF NOT EXISTS advance_paid integer NOT NULL DEFAULT 0,
      ADD COLUMN IF NOT EXISTS cod_balance integer NOT NULL DEFAULT 0,
      ADD COLUMN IF NOT EXISTS razorpay_payment_id text,
      ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'pending_payment',
      ADD COLUMN IF NOT EXISTS refund_status text NOT NULL DEFAULT 'none',
      ADD COLUMN IF NOT EXISTS refund_amount integer NOT NULL DEFAULT 0,
      ADD COLUMN IF NOT EXISTS refund_note text,
      ADD COLUMN IF NOT EXISTS refunded_at timestamp with time zone,
      ADD COLUMN IF NOT EXISTS refund_ref text,
      ADD COLUMN IF NOT EXISTS cancelled_at timestamp with time zone,
      ADD COLUMN IF NOT EXISTS cancelled_by text,
      ADD COLUMN IF NOT EXISTS needs_attention boolean NOT NULL DEFAULT false,
      ADD COLUMN IF NOT EXISTS is_first_order boolean NOT NULL DEFAULT false;
  `;

  // Unique constraint on razorpay_payment_id if not present
  await sql`
    DO $$
    BEGIN
      IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'orders_razorpay_payment_id_unique'
      ) THEN
        ALTER TABLE orders ADD CONSTRAINT orders_razorpay_payment_id_unique UNIQUE (razorpay_payment_id);
      END IF;
    EXCEPTION WHEN OTHERS THEN
      NULL;
    END $$;
  `;

  // 2. Add fields to users table
  await sql`
    ALTER TABLE users
      ADD COLUMN IF NOT EXISTS phone_verified_at timestamp with time zone,
      ADD COLUMN IF NOT EXISTS first_order_offer_dismissed boolean NOT NULL DEFAULT false;
  `;

  // 3. Create addresses table
  await sql`
    CREATE TABLE IF NOT EXISTS addresses (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id text NOT NULL,
      name text NOT NULL,
      phone text NOT NULL,
      line1 text NOT NULL,
      line2 text,
      city text NOT NULL,
      state text NOT NULL,
      pincode text NOT NULL,
      is_default boolean NOT NULL DEFAULT false,
      created_at timestamp with time zone NOT NULL DEFAULT now(),
      updated_at timestamp with time zone NOT NULL DEFAULT now()
    );
  `;
  await sql`CREATE INDEX IF NOT EXISTS addresses_user_id_idx ON addresses (user_id);`;

  // 4. Create user_carts table
  await sql`
    CREATE TABLE IF NOT EXISTS user_carts (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id text NOT NULL UNIQUE,
      items jsonb NOT NULL DEFAULT '[]'::jsonb,
      updated_at timestamp with time zone NOT NULL DEFAULT now()
    );
  `;
  await sql`CREATE INDEX IF NOT EXISTS user_carts_user_id_idx ON user_carts (user_id);`;

  console.log('Checkout flow DB migration completed successfully!');
}

runMigration().catch((err) => {
  console.error('Migration failed:', err);
  process.exit(1);
});

