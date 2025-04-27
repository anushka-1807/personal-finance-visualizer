'use client';

import { useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { DollarSign, TrendingDown, TrendingUp, CreditCard, ArrowUpCircle, ArrowDownCircle, PiggyBank, BarChart4, CalendarDays } from 'lucide-react';
import { format } from 'date-fns';
import { TRANSACTION_CATEGORIES, TransactionCategory } from '@/models/Transaction';

interface Transaction {
  amount: number;
  date: string;
  description: string;
  category: TransactionCategory;
  isExpense: boolean;
}

interface DashboardProps {
  transactions: Transaction[];
}

export default function Dashboard({ transactions }: DashboardProps) {
  // Calculate summary data
  const summaryData = useMemo(() => {
    if (!transactions.length) {
      return {
        totalExpenses: 0,
        totalIncome: 0,
        netBalance: 0,
        mostRecentTransaction: null,
        topExpenseCategory: '',
        topExpenseAmount: 0,
        categorySummary: {}
      };
    }

    // Calculate total expenses and income
    const { totalExpenses, totalIncome, categorySummary } = transactions.reduce(
      (acc, transaction) => {
        const { amount, isExpense, category } = transaction;
        
        // Add to total expenses or income
        if (isExpense) {
          acc.totalExpenses += amount;

          // Add to category summary
          if (!acc.categorySummary[category]) {
            acc.categorySummary[category] = 0;
          }
          acc.categorySummary[category] += amount;
        } else {
          acc.totalIncome += amount;
        }
        
        return acc;
      },
      { 
        totalExpenses: 0, 
        totalIncome: 0, 
        categorySummary: {} as Record<string, number>
      }
    );

    // Find top expense category
    let topExpenseCategory = '';
    let topExpenseAmount = 0;

    for (const [category, amount] of Object.entries(categorySummary)) {
      if (amount > topExpenseAmount) {
        topExpenseAmount = amount;
        topExpenseCategory = category;
      }
    }

    // Find most recent transaction
    const sortedTransactions = [...transactions].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );
    const mostRecentTransaction = sortedTransactions[0] || null;

    // Calculate net balance
    const netBalance = totalIncome - totalExpenses;

    return {
      totalExpenses,
      totalIncome,
      netBalance,
      mostRecentTransaction,
      topExpenseCategory,
      topExpenseAmount,
      categorySummary
    };
  }, [transactions]);

  // Format currency
  const formatCurrency = (amount: number) => `$${amount.toFixed(2)}`;

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
      {/* Total Expenses Card */}
      <Card className="dashboard-card card-hover-effect border-0 overflow-hidden bg-gradient-to-br from-rose-50 to-white dark:from-rose-950/30 dark:to-background">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
          <div className="h-8 w-8 rounded-full bg-rose-100 dark:bg-rose-950/50 flex items-center justify-center">
            <ArrowDownCircle className="h-5 w-5 expense-text" />
          </div>
        </CardHeader>
        <CardContent className="pb-6">
          <div className="text-3xl font-bold expense-text">${summaryData.totalExpenses.toFixed(2)}</div>
          <div className="flex items-center mt-2">
            <div className="h-2 w-2 rounded-full bg-rose-500 mr-1"></div>
            <p className="text-xs text-muted-foreground">
              {transactions.filter(t => t.isExpense).length} expense transactions
            </p>
          </div>
        </CardContent>
      </Card>
      
      {/* Total Income Card */}
      <Card className="dashboard-card card-hover-effect border-0 overflow-hidden bg-gradient-to-br from-emerald-50 to-white dark:from-emerald-950/30 dark:to-background">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Income</CardTitle>
          <div className="h-8 w-8 rounded-full bg-emerald-100 dark:bg-emerald-950/50 flex items-center justify-center">
            <ArrowUpCircle className="h-5 w-5 income-text" />
          </div>
        </CardHeader>
        <CardContent className="pb-6">
          <div className="text-3xl font-bold income-text">${summaryData.totalIncome.toFixed(2)}</div>
          <div className="flex items-center mt-2">
            <div className="h-2 w-2 rounded-full bg-emerald-500 mr-1"></div>
            <p className="text-xs text-muted-foreground">
              {transactions.filter(t => !t.isExpense).length} income transactions
            </p>
          </div>
        </CardContent>
      </Card>
      
      {/* Net Balance Card */}
      <Card className="dashboard-card card-hover-effect border-0 overflow-hidden bg-gradient-to-br from-indigo-50 to-white dark:from-indigo-950/30 dark:to-background">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Net Balance</CardTitle>
          <div className="h-8 w-8 rounded-full bg-indigo-100 dark:bg-indigo-950/50 flex items-center justify-center">
            <PiggyBank className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
          </div>
        </CardHeader>
        <CardContent className="pb-6">
          <div className={`text-3xl font-bold ${summaryData.netBalance >= 0 ? 'income-text' : 'expense-text'}`}>
            ${Math.abs(summaryData.netBalance).toFixed(2)}
            <span className="text-base font-medium ml-1">{summaryData.netBalance >= 0 ? 'surplus' : 'deficit'}</span>
          </div>
          <div className="flex items-center mt-2">
            <div className={`h-2 w-2 rounded-full ${summaryData.netBalance >= 0 ? 'bg-emerald-500' : 'bg-rose-500'} mr-1`}></div>
            <p className="text-xs text-muted-foreground">
              {summaryData.netBalance >= 0 
                ? 'You\'re in good financial health' 
                : 'Expenses exceed income'}
            </p>
          </div>
        </CardContent>
      </Card>
      
      {/* Top Expense Category Card */}
      <Card className="dashboard-card card-hover-effect border-0 overflow-hidden bg-gradient-to-br from-amber-50 to-white dark:from-amber-950/30 dark:to-background">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Top Expense Category</CardTitle>
          <div className="h-8 w-8 rounded-full bg-amber-100 dark:bg-amber-950/50 flex items-center justify-center">
            <BarChart4 className="h-5 w-5 text-amber-600 dark:text-amber-400" />
          </div>
        </CardHeader>
        <CardContent className="pb-6">
          <div className="text-2xl font-bold">{summaryData.topExpenseCategory || 'N/A'}</div>
          <div className="flex items-center mt-2">
            <div className="h-2 w-2 rounded-full bg-amber-500 mr-1"></div>
            <p className="text-xs text-muted-foreground">
              {summaryData.topExpenseCategory 
                ? `$${summaryData.topExpenseAmount.toFixed(2)} spent` 
                : 'No expense data available'}
            </p>
          </div>
        </CardContent>
      </Card>
      
      {/* Most Recent Transaction Card */}
      {summaryData.mostRecentTransaction && (
        <Card className="dashboard-card card-hover-effect border-0 overflow-hidden md:col-span-2 lg:col-span-4 mt-6 bg-gradient-to-br from-slate-50 to-white dark:from-slate-950/30 dark:to-background">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Most Recent Transaction</CardTitle>
            <div className="h-8 w-8 rounded-full bg-slate-100 dark:bg-slate-950/50 flex items-center justify-center">
              <CalendarDays className="h-5 w-5 text-slate-600 dark:text-slate-400" />
            </div>
          </CardHeader>
          <CardContent className="pb-6">
            <div className="flex justify-between items-center">
              <div>
                <div className="text-lg font-medium">
                  {summaryData.mostRecentTransaction.description}
                </div>
                <div className="flex items-center mt-1">
                  <div className="h-2 w-2 rounded-full bg-slate-500 mr-1"></div>
                  <p className="text-xs text-muted-foreground">
                    {summaryData.mostRecentTransaction.category} • {formatDate(summaryData.mostRecentTransaction.date)}
                  </p>
                </div>
              </div>
              <div className="flex items-center">
                <div className={`px-3 py-1 rounded-full ${summaryData.mostRecentTransaction.isExpense ? 'bg-rose-100 text-rose-600 dark:bg-rose-950/50 dark:text-rose-400' : 'bg-emerald-100 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400'}`}>
                  <span className="flex items-center text-sm font-medium">
                    {summaryData.mostRecentTransaction.isExpense ? (
                      <>
                        <TrendingDown className="h-3.5 w-3.5 mr-1" />
                        {formatCurrency(summaryData.mostRecentTransaction.amount)}
                      </>
                    ) : (
                      <>
                        <TrendingUp className="h-3.5 w-3.5 mr-1" />
                        {formatCurrency(summaryData.mostRecentTransaction.amount)}
                      </>
                    )}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
