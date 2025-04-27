'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { Budget } from '@/models/Budget';
import BudgetList from './BudgetList';
import BudgetVsActualChart from './BudgetVsActualChart';
type BudgetWithRequiredId = Budget & { _id: string };
import { Button } from './ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import BudgetForm from './BudgetForm';

// Get current month in YYYY-MM format
const getCurrentMonth = () => format(new Date(), 'yyyy-MM');

// Generate an array of the last 12 months in YYYY-MM format
const getLast12Months = () => {
  const months = [];
  const today = new Date();
  
  for (let i = 0; i < 12; i++) {
    const month = new Date(today.getFullYear(), today.getMonth() - i, 1);
    months.push(format(month, 'yyyy-MM'));
  }
  
  return months;
};



interface Transaction {
  _id: string;
  amount: number;
  date: string;
  description: string;
  category: string;
  isExpense: boolean;
}

interface BudgetPageProps {
  transactions: Transaction[];
}

export default function BudgetPage({ transactions }: BudgetPageProps) {
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState(getCurrentMonth());
  const [isFormOpen, setIsFormOpen] = useState(false);
  const months = getLast12Months();

  // Fetch budgets from the API
  const fetchBudgets = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/budgets');
      
      if (!response.ok) {
        throw new Error('Failed to fetch budgets');
      }
      
      const data = await response.json();
      setBudgets(data.budgets);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to load budgets');
      console.error('Error fetching budgets:', error);
    } finally {
      setLoading(false);
    }
  };

  // Load budgets on initial render
  useEffect(() => {
    fetchBudgets();
  }, []);

  // Filter budgets by the selected month and ensure all required fields are present
  const filteredBudgets = budgets
    .filter(budget => budget.month === selectedMonth)
    .map(budget => ({
      _id: budget._id || '',
      category: budget.category,
      amount: budget.amount,
      month: budget.month,
      notes: budget.notes
    })) as Array<{
      _id: string;
      category: string;
      amount: number;
      month: string;
      notes?: string;
    }>;

  // Format month for display
  const formatMonth = (monthStr: string) => {
    const [year, month] = monthStr.split('-');
    const date = new Date(parseInt(year), parseInt(month) - 1, 1);
    return format(date, 'MMMM yyyy');
  };

  return (
    <div className="space-y-6 slide-up">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight page-header">Budget Management</h2>
          <p className="text-muted-foreground mt-2">Set and track spending limits for each category</p>
        </div>
        <Button onClick={() => setIsFormOpen(true)} className="bg-gradient-to-r from-primary/90 to-primary hover:from-primary hover:to-primary/90">
          <span className="mr-2">+</span> Quick Add Budget
        </Button>
      </div>

      <div className="flex items-center space-x-2 p-3 bg-muted/50 rounded-lg max-w-xs">
        <CalendarIcon className="h-5 w-5 text-primary" />
        <Select value={selectedMonth} onValueChange={setSelectedMonth}>
          <SelectTrigger className="w-[180px] border-none bg-transparent focus:ring-0 focus:ring-offset-0 focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:ring-transparent">
            <SelectValue placeholder="Select Month" />
          </SelectTrigger>
          <SelectContent>
            {months.map(month => (
              <SelectItem key={month} value={month}>
                {formatMonth(month)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="w-full max-w-md">
          <TabsTrigger value="overview" className="text-sm md:text-base">Overview</TabsTrigger>
          <TabsTrigger value="manage" className="text-sm md:text-base">Manage Budgets</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-4">
          <BudgetVsActualChart 
            transactions={transactions} 
            budgets={budgets.map(b => ({ ...b, _id: b._id || '' })) as BudgetWithRequiredId[]}
            month={selectedMonth}
          />
          
          <Card className="dashboard-card border-0 overflow-hidden">
            <CardHeader>
              <CardTitle>Budget Summary: {formatMonth(selectedMonth)}</CardTitle>
              <CardDescription>Track your spending against budgeted amounts</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-4">Loading budget data...</div>
              ) : filteredBudgets.length === 0 ? (
                <div className="text-center py-4 text-muted-foreground">
                  No budgets set for this month. Add a budget to get started.
                </div>
              ) : (
                <div className="dashboard-grid">
                  {filteredBudgets.map(budget => {
                    // Calculate actual spending for this category in the selected month
                    const actualSpending = transactions
                      .filter(t => {
                        const tMonth = format(new Date(t.date), 'yyyy-MM');
                        return tMonth === selectedMonth && 
                               t.category === budget.category &&
                               t.isExpense;
                      })
                      .reduce((sum, t) => sum + t.amount, 0);
                    
                    // Calculate percentage of budget used
                    const percentUsed = budget.amount > 0 
                      ? Math.round((actualSpending / budget.amount) * 100)
                      : 0;
                    
                    // Determine status based on percentage used
                    let status = 'text-green-500';
                    if (percentUsed > 100) {
                      status = 'text-red-500';
                    } else if (percentUsed > 80) {
                      status = 'text-amber-500';
                    }
                    
                    return (
                      <Card key={budget._id} className="dashboard-card card-hover-effect border-0 overflow-hidden bg-gradient-to-br from-slate-50 to-white dark:from-slate-950/30 dark:to-background">
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm font-medium">
                            {budget.category}
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="text-2xl font-bold ${status}">
                            ${actualSpending.toFixed(2)} <span className="text-sm font-normal text-muted-foreground">/ ${budget.amount.toFixed(2)}</span>
                          </div>
                          <div className="budget-progress-bar mt-2">
                            <div 
                              className={`budget-progress-bar-inner ${percentUsed > 100 ? 'budget-over' : percentUsed > 80 ? 'budget-warning' : 'budget-under'}`}
                              style={{ width: `${Math.min(percentUsed, 100)}%` }}
                            />
                          </div>
                          <div className="flex justify-between mt-1">
                            <div className={`text-xs font-medium ${status}`}>
                              {percentUsed}% used
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {percentUsed > 100 ? 'Over budget!' : percentUsed > 80 ? 'Almost at limit' : 'Under budget'}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="manage">
          <BudgetList 
            budgets={budgets.map(b => ({ ...b, _id: b._id || '' })) as BudgetWithRequiredId[]} 
            onRefresh={fetchBudgets} 
          />
        </TabsContent>
      </Tabs>
      
      {/* Quick Add Budget Dialog */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="sm:max-w-[525px]">
          <DialogHeader>
            <DialogTitle>Add New Budget</DialogTitle>
          </DialogHeader>
          <BudgetForm 
            onSave={async (data) => {
              try {
                const response = await fetch('/api/budgets', {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                  },
                  body: JSON.stringify(data),
                });
                
                if (!response.ok) {
                  const errorData = await response.json();
                  throw new Error(errorData.error || 'Failed to create budget');
                }
                
                toast.success('Budget created successfully');
                setIsFormOpen(false);
                fetchBudgets();
              } catch (error) {
                toast.error(error instanceof Error ? error.message : 'An error occurred');
              }
            }}
            onCancel={() => setIsFormOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
