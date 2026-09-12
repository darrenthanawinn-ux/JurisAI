export interface TaxCalculationInput {
  country: string;
  state?: string;
  amount: number;
  customerType: 'B2C' | 'B2B';
  vatNumber?: string;
}

export interface TaxCalculationResult {
  jurisdiction: string;
  taxRate: number;
  taxAmount: number;
  totalAmount: number;
  nexusAlert: boolean;
  thresholdLimit: number;
}

export function calculateTax(input: TaxCalculationInput): TaxCalculationResult {
  const { country, state, amount, customerType } = input;
  let taxRate = 0;
  let jurisdiction = country.toUpperCase();
  let thresholdLimit = 100000;

  if (jurisdiction === 'US') {
    thresholdLimit = 100000;
    if (state === 'CA') {
      taxRate = 0.0725;
      jurisdiction = 'US-CA';
    } else if (state === 'NY') {
      taxRate = 0.04;
      jurisdiction = 'US-NY';
    } else if (state === 'TX') {
      taxRate = 0.0625;
      jurisdiction = 'US-TX';
    } else {
      taxRate = 0.05;
      jurisdiction = state ? `US-${state}` : 'US';
    }
  } else if (jurisdiction === 'GB') {
    thresholdLimit = 85000;
    taxRate = 0.20;
  } else if (['DE', 'FR', 'IT', 'ES', 'NL', 'BE', 'AT', 'PT', 'IE', 'FI'].includes(jurisdiction)) {
    thresholdLimit = 10000;
    if (customerType === 'B2B' && input.vatNumber) {
      taxRate = 0;
    } else {
      taxRate = 0.19;
    }
  } else if (jurisdiction === 'IN') {
    thresholdLimit = 2000000;
    taxRate = 0.18;
  } else {
    taxRate = 0.0;
    thresholdLimit = 50000;
  }

  const taxAmount = Number((amount * taxRate).toFixed(2));
  const totalAmount = Number((amount + taxAmount).toFixed(2));

  return {
    jurisdiction,
    taxRate,
    taxAmount,
    totalAmount,
    nexusAlert: amount >= (thresholdLimit * 0.8),
    thresholdLimit,
  };
}
