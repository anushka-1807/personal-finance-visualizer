'use client';

import { useState } from 'react';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Edit, Trash2, Plus } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import BudgetForm from './BudgetForm';
import { format, parse } from 'date-fns';

import { Budget as BudgetModel } from '@/models/Budget';

// Frontend representation of Budget
interface Budget extends Omit<BudgetModel, '_id'> {
  _id: string; // Make _id required for the UI
}

interface BudgetListProps {
  budgets: Budget[];
  onRefresh: () => void;
}

export default function BudgetList({ budgets, onRefresh }: BudgetListProps) {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedBudget, setSelectedBudget] = useState<Budget | null>(null);

  // Format month string (YYYY-MM) to a more readable format (Month YYYY)
  const formatMonth = (monthStr: string) => {
    try {
      const date = parse(monthStr, 'yyyy-MM', new Date());
      return format(date, 'MMMM yyyy');
    } catch (_) {
      return monthStr; // Fallback to original string
    }
  };

  // Handle opening the edit dialog
  const handleEdit = (budget: Budget) => {
    setSelectedBudget(budget);
    setIsFormOpen(true);
  };

  // Handle opening the delete confirmation dialog
  const handleDeleteClick = (budget: Budget) => {
    setSelectedBudget(budget);
    setIsDeleteDialogOpen(true);
  };

  // Handle confirming the delete action
  const handleDeleteConfirm = async () => {
    if (!selectedBudget) return;

    try {
      const response = await fetch(`/api/budgets/${selectedBudget._id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to delete budget');
      }

      toast.success('Budget deleted successfully');
      setIsDeleteDialogOpen(false);
      onRefresh(); // Refresh the budget list
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'An error occurred');
    }
  };

  // Handle saving a new or updated budget
  const handleSaveBudget = async (formData: Omit<Budget, '_id' | 'createdAt' | 'updatedAt'>) => {
    try {
      // Determine if this is an update or create operation
      const isUpdate = selectedBudget !== null;
      const url = isUpdate 
        ? `/api/budgets/${selectedBudget._id}` 
        : '/api/budgets';
      
      const response = await fetch(url, {
        method: isUpdate ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to save budget');
      }

      toast.success(`Budget ${isUpdate ? 'updated' : 'created'} successfully`);
      setIsFormOpen(false);
      setSelectedBudget(null);
      onRefresh(); // Refresh the budget list
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'An error occurred');
    }
  };

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Budget Management</CardTitle>
          <Button onClick={() => { setSelectedBudget(null); setIsFormOpen(true); }} size="sm">
            <Plus className="h-4 w-4 mr-2" /> Add Budget
          </Button>
        </CardHeader>
        <CardContent>
          {budgets.length === 0 ? (
            <div className="text-center py-6 text-muted-foreground">
              No budgets found. Create your first budget to get started.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Category</TableHead>
                  <TableHead>Month</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead>Notes</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {budgets.map((budget) => (
                  <TableRow key={budget._id}>
                    <TableCell>
                      <Badge variant="outline">{budget.category}</Badge>
                    </TableCell>
                    <TableCell>{formatMonth(budget.month)}</TableCell>
                    <TableCell className="text-right font-medium">
                      ${budget.amount.toFixed(2)}
                    </TableCell>
                    <TableCell className="truncate max-w-[200px]">
                      {budget.notes || '-'}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => handleEdit(budget)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="text-destructive"
                        onClick={() => handleDeleteClick(budget)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Budget Form Dialog */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="sm:max-w-[525px]">
          <DialogHeader>
            <DialogTitle>{selectedBudget ? 'Edit' : 'Add'} Budget</DialogTitle>
          </DialogHeader>
          <BudgetForm 
            budget={selectedBudget} 
            onSave={handleSaveBudget}
            onCancel={() => setIsFormOpen(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the budget for {selectedBudget?.category} ({formatMonth(selectedBudget?.month || '')}).
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm} className="bg-destructive text-destructive-foreground">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
