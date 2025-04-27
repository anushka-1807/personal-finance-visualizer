'use client';

import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { TransactionCategory } from '@/models/Transaction';
import TransactionForm from '@/components/TransactionForm';
import TransactionList from '@/components/TransactionList';
import MonthlyExpensesChart from '@/components/MonthlyExpensesChart';
import CategoryPieChart from '@/components/CategoryPieChart';
import Dashboard from '@/components/Dashboard';
import BudgetPage from '@/components/BudgetPage';

interface Transaction {
  _id: string;
  amount: number;
  date: string;
  description: string;
  category: TransactionCategory;
  isExpense: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export default function Home() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [dbConnectionError, setDbConnectionError] = useState<string | null>(null);

  // Fetch transactions
  const fetchTransactions = async () => {
    try {
      setIsLoading(true);
      setDbConnectionError(null);
      const response = await fetch('/api/transactions');
      
      const data = await response.json();
      
      if (!response.ok) {
        // Check if it's a MongoDB connection error
        if (data.error && data.error.includes('database')) {
          setDbConnectionError(data.error);
          throw new Error(data.error);
        }
        throw new Error(data.error || 'Failed to fetch transactions');
      }
      
      setTransactions(data);
    } catch (error: unknown) {
      console.error('Error fetching transactions:', error);
      toast.error(error instanceof Error ? error.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };
  
  useEffect(() => {
    fetchTransactions();
  }, []);
  
  // Handle create/update transaction
  const handleSaveTransaction = async (transactionData: Omit<Transaction, '_id'>) => {
    try {
      const isEditing = !!selectedTransaction;
      const url = isEditing 
        ? `/api/transactions/${selectedTransaction._id}`
        : '/api/transactions';
      
      const method = isEditing ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(transactionData),
      });
      
      if (!response.ok) {
        throw new Error(`Failed to ${isEditing ? 'update' : 'create'} transaction`);
      }
      
      toast.success(`Transaction ${isEditing ? 'updated' : 'added'} successfully`);
      setSelectedTransaction(null);
      fetchTransactions();
    } catch (error: unknown) {
      console.error('Error saving transaction:', error);
      toast.error(error instanceof Error ? error.message : 'An error occurred');
    }
  };
  
  // Handle delete transaction
  const handleDeleteTransaction = async (id: string) => {
    try {
      const response = await fetch(`/api/transactions/${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete transaction');
      }
      
      toast.success('Transaction deleted successfully');
      fetchTransactions();
    } catch (error: unknown) {
      console.error('Error deleting transaction:', error);
      toast.error(error instanceof Error ? error.message : 'An error occurred');
    }
  };
  
  // Handle edit transaction
  const handleEditTransaction = (transaction: Transaction) => {
    setSelectedTransaction(transaction);
  };
  
  return (
    <main className="container mx-auto py-8 px-4 fade-in">
      <div className="flex flex-col md:flex-row justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold page-header">Personal Finance Visualizer</h1>
          <p className="text-muted-foreground mt-2">Track, analyze, and optimize your finances</p>
        </div>
        <div className="flex items-center gap-2 mt-4 md:mt-0">
          <div className="bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium">
            {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
          </div>
        </div>
      </div>
      
      {/* Database Connection Error Message */}
      {dbConnectionError && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6" role="alert">
          <div className="flex">
            <div className="py-1">
              <svg className="fill-current h-6 w-6 text-red-500 mr-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                <path d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" />
              </svg>
            </div>
            <div>
              <p className="font-bold">Database Connection Error</p>
              <p className="text-sm">{dbConnectionError}</p>
              <p className="text-sm mt-2">Make sure MongoDB is installed and running on your system, or configure a MongoDB Atlas connection string in .env.local file.</p>
            </div>
          </div>
        </div>
      )}
      
      {/* Dashboard Summary Cards */}
      <div className="mb-8 slide-up">
        <Dashboard transactions={transactions} />
      </div>
      
      <Tabs defaultValue="transactions" className="w-full">
        <TabsList className="grid w-full grid-cols-4 mb-6 max-w-3xl mx-auto">
          <TabsTrigger value="transactions" className="text-sm md:text-base">Transactions</TabsTrigger>
          <TabsTrigger value="charts" className="text-sm md:text-base">Charts</TabsTrigger>
          <TabsTrigger value="budgets" className="text-sm md:text-base">Budgets</TabsTrigger>
          <TabsTrigger value="add" className="text-sm md:text-base">Add Transaction</TabsTrigger>
        </TabsList>
        
        <TabsContent value="transactions" className="space-y-4 slide-up">
          <Card className="dashboard-card overflow-hidden border-0">
            <CardHeader>
              <CardTitle>Transactions</CardTitle>
              <CardDescription>View and manage your transactions</CardDescription>
            </CardHeader>
            <CardContent>
              <TransactionList 
                transactions={transactions} 
                isLoading={isLoading} 
                onEdit={handleEditTransaction}
                onDelete={handleDeleteTransaction}
              />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="charts" className="space-y-4 slide-up">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Monthly Expenses Chart */}
            <Card className="dashboard-card border-0 overflow-hidden">
              <CardHeader>
                <CardTitle>Monthly Expenses</CardTitle>
                <CardDescription>Your spending trend over the past months</CardDescription>
              </CardHeader>
              <CardContent>
                <MonthlyExpensesChart transactions={transactions} />
              </CardContent>
            </Card>
            
            {/* Category Breakdown */}
            <Card className="dashboard-card border-0 overflow-hidden">
              <CardHeader>
                <CardTitle>Expense Categories</CardTitle>
                <CardDescription>Breakdown of expenses by category</CardDescription>
              </CardHeader>
              <CardContent>
                <CategoryPieChart transactions={transactions} />
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="budgets" className="slide-up">
          <BudgetPage transactions={transactions} />
        </TabsContent>
        
        <TabsContent value="add" className="slide-up">
          <Card className="dashboard-card border-0 max-w-2xl mx-auto">
            <CardHeader>
              <CardTitle>{selectedTransaction ? 'Edit Transaction' : 'Add Transaction'}</CardTitle>
              <CardDescription>
                {selectedTransaction ? 'Update transaction details' : 'Fill in the details to add a new transaction'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <TransactionForm 
                onSave={handleSaveTransaction}
                transaction={selectedTransaction}
                onCancel={() => setSelectedTransaction(null)}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </main>
  );
}
