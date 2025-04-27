'use client';

import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  Cell,
  LabelList
} from 'recharts';
import { format, parse } from 'date-fns';

interface BudgetVsActualChartProps {
  transactions: Array<{
    _id: string;
    amount: number;
    date: string;
    description: string;
    category: string;
    isExpense: boolean;
  }>;
  budgets: Array<{
    _id: string;
    category: string;
    amount: number;
    month: string;
  }>;
  month: string; // In format YYYY-MM
}

export default function BudgetVsActualChart({ transactions, budgets, month }: BudgetVsActualChartProps) {
  // Transform data for the chart
  const chartData = useMemo(() => {
    // Filter transactions for the specified month and expenses only
    const monthTransactions = transactions.filter(t => {
      const transactionDate = new Date(t.date);
      const transactionMonth = format(transactionDate, 'yyyy-MM');
      return transactionMonth === month && t.isExpense;
    });

    // Group transactions by category and sum amounts
    const categoryExpenses = monthTransactions.reduce<Record<string, number>>((acc, transaction) => {
      acc[transaction.category] = (acc[transaction.category] || 0) + transaction.amount;
      return acc;
    }, {});

    // Create data array for the chart
    const data = budgets
      .filter(budget => budget.month === month)
      .map(budget => {
        const actual = categoryExpenses[budget.category] || 0;
        const remaining = Math.max(budget.amount - actual, 0);
        const overBudget = actual > budget.amount ? actual - budget.amount : 0;
        
        return {
          category: budget.category,
          budgeted: budget.amount,
          actual,
          remaining,
          overBudget,
          // Calculate percentage used
          percentUsed: Math.round((actual / budget.amount) * 100),
          // Status for color coding
          status: actual <= budget.amount * 0.8 
            ? 'good' 
            : actual <= budget.amount 
              ? 'warning'
              : 'over'
        };
      });

    return data;
  }, [transactions, budgets, month]);

  // Format month string for display
  const formattedMonth = useMemo(() => {
    try {
      const date = parse(month, 'yyyy-MM', new Date());
      return format(date, 'MMMM yyyy');
    } catch (error) {
      return month;
    }
  }, [month]);

  // Color mapping for status
  const getBarColor = (status: string) => {
    switch (status) {
      case 'good': return '#10b981'; // Green
      case 'warning': return '#f59e0b'; // Amber
      case 'over': return '#ef4444'; // Red
      default: return '#6366f1'; // Indigo (default)
    }
  };

  // Custom tooltip for the chart
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-background border rounded-md p-3 shadow-md">
          <p className="font-medium">{data.category}</p>
          <p className="text-sm">Budgeted: ${data.budgeted.toFixed(2)}</p>
          <p className="text-sm">Actual: ${data.actual.toFixed(2)}</p>
          {data.status === 'over' ? (
            <p className="text-sm text-destructive">Over budget by: ${data.overBudget.toFixed(2)}</p>
          ) : (
            <p className="text-sm text-muted-foreground">Remaining: ${data.remaining.toFixed(2)}</p>
          )}
          <p className="text-sm font-semibold mt-1">
            {data.percentUsed}% of budget used
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Budget vs. Actual ({formattedMonth})</CardTitle>
      </CardHeader>
      <CardContent>
        {chartData.length === 0 ? (
          <div className="text-center py-10 text-muted-foreground">
            No budget data available for this month. Add budgets to see a comparison.
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={400}>
            <BarChart
              data={chartData}
              margin={{
                top: 20,
                right: 30,
                left: 20,
                bottom: 70,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="category" 
                angle={-45} 
                textAnchor="end"
                height={70}
                interval={0}
              />
              <YAxis 
                tickFormatter={(value) => `$${value}`}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Bar name="Budget" dataKey="budgeted" fill="#6366f1" opacity={0.3} />
              <Bar name="Actual Spending" dataKey="actual">
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={getBarColor(entry.status)} />
                ))}
                <LabelList 
                  dataKey="percentUsed" 
                  position="top" 
                  formatter={(value: number) => `${value}%`}
                />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}
