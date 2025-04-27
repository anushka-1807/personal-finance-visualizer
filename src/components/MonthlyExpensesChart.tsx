'use client';

import { useMemo } from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Legend
} from 'recharts';
import { format, subMonths, startOfMonth, endOfMonth } from 'date-fns';

interface Transaction {
  amount: number;
  date: string;
  description: string;
}

interface MonthData {
  name: string;
  expenses: number;
}

interface MonthlyExpensesChartProps {
  transactions: Transaction[];
}

export default function MonthlyExpensesChart({ transactions }: MonthlyExpensesChartProps) {
  // Generate data for the last 6 months
  const chartData = useMemo(() => {
    // Create array of last 6 months
    const months: MonthData[] = [];
    const today = new Date();
    
    for (let i = 5; i >= 0; i--) {
      const monthDate = subMonths(today, i);
      const monthName = format(monthDate, 'MMM yyyy');
      months.push({
        name: monthName,
        expenses: 0,
      });
    }
    
    // No transactions, return empty months
    if (!transactions || transactions.length === 0) {
      return months;
    }
    
    // Populate month data with expenses
    transactions.forEach((transaction) => {
      const txDate = new Date(transaction.date);
      const monthName = format(txDate, 'MMM yyyy');
      
      // Only include transactions from the last 6 months
      const sixMonthsAgo = startOfMonth(subMonths(today, 5));
      if (txDate >= sixMonthsAgo && txDate <= endOfMonth(today)) {
        const monthIndex = months.findIndex((m) => m.name === monthName);
        if (monthIndex !== -1) {
          months[monthIndex].expenses += transaction.amount;
        }
      }
    });
    
    return months;
  }, [transactions]);

  if (!transactions || transactions.length === 0) {
    return (
      <div className="flex justify-center items-center h-[300px] text-muted-foreground">
        No transaction data available to display chart
      </div>
    );
  }

  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={chartData}
          margin={{
            top: 20,
            right: 30,
            left: 20,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis 
            tickFormatter={(value) => `$${value}`}
            label={{ value: 'Amount ($)', angle: -90, position: 'insideLeft' }}
          />
          <Tooltip 
            formatter={(value) => [`$${Number(value).toFixed(2)}`, 'Expenses']}
            labelFormatter={(label) => `Month: ${label}`}
          />
          <Legend />
          <Bar dataKey="expenses" fill="#3b82f6" name="Expenses" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
