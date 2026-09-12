import { z } from 'zod';

export const taxCalcSchema = z.object({
  country: z.string().length(2),
  state: z.string().optional(),
  amount: z.number().positive(),
  customerType: z.enum(['B2C', 'B2B']),
  vatNumber: z.string().optional(),
});
