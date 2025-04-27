'use client';

import { useMemo } from 'react';
import { 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer, 
  Legend, 
  Tooltip 
} from 'recharts';
import { TRANSACTION_CATEGORIES, TransactionCategory } from '@/models/Transaction';

interface Transaction {
  amount: number;
  category: TransactionCategory;
  isExpense: boolean;
}

interface CategoryData {
  name: string;
  value: number;
  color: string;
}

// Fixed colors for categories
const COLORS = [
  '#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#A28DD0',
  '#FF6B6B', '#4ECDC4', '#C7F464', '#FF9800', '#9C27B0',
  '#3F51B5', '#03A9F4', '#8BC34A', '#FFC107', '#795548'
];

// Create a mapping between categories and colors
const categoryColorMap = Object.fromEntries(
  TRANSACTION_CATEGORIES.map((category, index) => [category, COLORS[index % COLORS.length]])
);

interface CategoryPieChartProps {
  transactions: Transaction[];
  expensesOnly?: boolean; // When true, only show expenses
}

export default function CategoryPieChart({ transactions, expensesOnly = true }: CategoryPieChartProps) {
  const chartData = useMemo(() => {
    // Filter transactions if needed
    const filteredTransactions = expensesOnly 
      ? transactions.filter(t => t.isExpense) 
      : transactions;
    
    if (!filteredTransactions.length) {
      return [];
    }

    // Group transactions by category and sum amounts
    const categoryMap = new Map<string, number>();
    
    filteredTransactions.forEach((transaction) => {
      const { category, amount } = transaction;
      const currentTotal = categoryMap.get(category) || 0;
      categoryMap.set(category, currentTotal + amount);
    });

    // Convert to chart data format and sort by value (descending)
    const data: CategoryData[] = Array.from(categoryMap.entries())
      .map(([name, value]) => ({
        name,
        value,
        color: categoryColorMap[name as TransactionCategory]
      }))
      .sort((a, b) => b.value - a.value);

    return data;
  }, [transactions, expensesOnly]);

  if (!transactions.length) {
    return (
      <div className="flex justify-center items-center h-[300px] text-muted-foreground">
        No transaction data available to display chart
      </div>
    );
  }

  // Format number as currency for tooltip
  const formatCurrency = (value: number) => `$${value.toFixed(2)}`;

  return (
    <div className="h-[320px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            labelLine={false}
            outerRadius={100}
            fill="#8884d8"
            dataKey="value"
            nameKey="name"
            label={({name, percent}) => `${name}: ${(percent * 100).toFixed(0)}%`}
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip formatter={(value: number) => formatCurrency(value)} />
          <Legend layout="vertical" align="right" verticalAlign="middle" />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
