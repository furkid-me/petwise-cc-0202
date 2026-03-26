import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// This endpoint creates the expense_records table if it doesn't exist
// Called once after deployment to set up the new table
export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const adminPassword = body.password || request.headers.get('x-admin-password');
    
    // Simple password check (in production, use proper auth)
    if (adminPassword !== process.env.ADMIN_PASSWORD) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Create expense_records table using raw SQL
    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS "expense_records" (
        "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
        "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT now(),
        "user_id" UUID NOT NULL,
        "pet_id" UUID NOT NULL,
        "record_date" DATE NOT NULL,
        "category" TEXT NOT NULL,
        "description" TEXT NOT NULL,
        "amount" DECIMAL(8, 2) NOT NULL,
        "notes" TEXT,
        CONSTRAINT "expense_records_pkey" PRIMARY KEY ("id")
      );
    `;

    // Create index
    await prisma.$executeRaw`
      CREATE INDEX IF NOT EXISTS "expense_records_pet_id_record_date_idx" 
      ON "expense_records"("pet_id", "record_date");
    `;

    return NextResponse.json({ 
      success: true, 
      message: 'expense_records table created successfully' 
    });
  } catch (error) {
    console.error('Setup error:', error);
    return NextResponse.json({ 
      error: 'Failed to create table',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
