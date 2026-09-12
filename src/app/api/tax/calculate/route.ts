import { NextResponse } from 'next/server';
import { taxCalcSchema } from '@/lib/validators';
import { calculateTax } from '@/lib/taxEngine';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const validation = taxCalcSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ error: validation.error.format() }, { status: 400 });
    }

    const result = calculateTax(validation.data);

    // 1. Ensure a default hackathon user exists to satisfy foreign key constraints
    let defaultUser = await prisma.user.findFirst({
      where: { email: 'sandbox@juris.ai' }
    });

    if (!defaultUser) {
      defaultUser = await prisma.user.create({
        data: {
          email: 'sandbox@juris.ai',
          passwordHash: 'placeholder',
          companyName: 'Hackathon Demo Corp',
        },
      });
    }

    // 2. Save calculation linked to the valid user ID
    await prisma.transaction.create({
      data: {
        userId: defaultUser.id,
        customerEmail: 'sandbox@juris.ai',
        amount: Number(validation.data.amount),
        taxAmount: Number(result.taxAmount || 0),
        taxRate: Number(result.taxRate || 0),
        country: validation.data.country,
        state: validation.data.state || null,
        jurisdiction: result.jurisdiction || validation.data.country,
      },
    });

    return NextResponse.json({ success: true, data: result }, { status: 200 });
  } catch (error: any) {
    console.error("Calculation save error:", error);
    return NextResponse.json({ success: false, error: error.message || 'Internal server error' }, { status: 500 });
  }
}