'use client';
import React, { useState, useEffect } from 'react';
import { Globe } from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

export default function Dashboard() {
  const [country, setCountry] = useState('US');
  const [state, setState] = useState('CA');
  const [amount, setAmount] = useState('500');
  const [customerType, setCustomerType] = useState('B2C');
  const [calcResult, setCalcResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [chartData, setChartData] = useState<any[]>([
    { month: 'Start', revenue: 0, taxCollected: 0 }
  ]);

  // Fetch real transactions from your database on load
  useEffect(() => {
    async function loadTransactions() {
      try {
        const res = await fetch('/api/tax/transactions');
        const data = await res.json();
        if (data.success && data.data.length > 0) {
          setChartData(data.data);
        }
      } catch (err) {
        console.error("Failed to load chart history", err);
      }
    }
    loadTransactions();
  }, []);

  const handleCalculate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('/api/tax/calculate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          country,
          state: country === 'US' ? state : undefined,
          amount: parseFloat(amount),
          customerType,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setCalcResult(data.data);
        
        // Instantly append the new calculation to the chart state so it moves live
        setChartData(prev => [
          ...prev,
          {
            month: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
            revenue: parseFloat(amount),
            taxCollected: data.data.taxAmount,
          }
        ]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#090d16] text-[#f3f4f6] p-6 lg:p-10">
      <header className="flex justify-between items-center mb-8 border-b border-gray-800 pb-5">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Globe className="text-indigo-500" /> JurisAI <span className="text-xs bg-indigo-900 text-indigo-300 px-2 py-0.5 rounded-full font-normal">v1.0</span>
          </h1>
          <p className="text-sm text-gray-400">Autonomous Cross-Border VAT, GST, and Sales Tax Compliance Engine</p>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="bg-[#111827] border border-gray-800 rounded-xl p-6 shadow-lg lg:col-span-1">
          <h2 className="text-lg font-semibold mb-4">Live Tax Calculator Sandbox</h2>
          <form onSubmit={handleCalculate} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1">Country ISO Code</label>
              <select value={country} onChange={(e) => setCountry(e.target.value)} className="w-full bg-[#1f2937] border border-gray-700 rounded-lg px-3 py-2 text-sm">
                <option value="US">United States (US)</option>
                <option value="GB">United Kingdom (GB)</option>
                <option value="DE">Germany (DE)</option>
                <option value="IN">India (IN)</option>
              </select>
            </div>
            {country === 'US' && (
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1">State</label>
                <select value={state} onChange={(e) => setState(e.target.value)} className="w-full bg-[#1f2937] border border-gray-700 rounded-lg px-3 py-2 text-sm">
                  <option value="CA">California (CA)</option>
                  <option value="NY">New York (NY)</option>
                  <option value="TX">Texas (TX)</option>
                </select>
              </div>
            )}
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1">Amount ($ USD)</label>
              <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} className="w-full bg-[#1f2937] border border-gray-700 rounded-lg px-3 py-2 text-sm" />
            </div>
            <button type="submit" disabled={loading} className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-medium py-2 rounded-lg text-sm">
              {loading ? 'Calculating...' : 'Calculate Tax'}
            </button>
          </form>

          {calcResult && (
            <div className="mt-6 bg-[#1f2937] border border-gray-700 rounded-lg p-4 space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-gray-400">Jurisdiction:</span> <span className="font-semibold">{calcResult.jurisdiction}</span></div>
              <div className="flex justify-between"><span className="text-gray-400">Tax Rate:</span> <span className="font-semibold">{(calcResult.taxRate * 100).toFixed(2)}%</span></div>
              <div className="flex justify-between"><span className="text-gray-400">Tax Amount:</span> <span className="font-semibold text-emerald-400">${calcResult.taxAmount}</span></div>
              <div className="flex justify-between border-t border-gray-600 pt-2"><span className="font-bold">Total:</span> <span className="font-bold text-white">${calcResult.totalAmount}</span></div>
            </div>
          )}
        </div>

        <div className="bg-[#111827] border border-gray-800 rounded-xl p-6 shadow-lg lg:col-span-2">
          <h2 className="text-lg font-semibold mb-4">Revenue & Tax Growth Trajectory</h2>
          <div className="w-full h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="month" stroke="#9ca3af" />
                <YAxis stroke="#9ca3af" />
                <Tooltip contentStyle={{ backgroundColor: '#1f2937', borderColor: '#374151' }} />
                <Area type="monotone" dataKey="revenue" stroke="#6366f1" fill="#6366f1" fillOpacity={0.3} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}