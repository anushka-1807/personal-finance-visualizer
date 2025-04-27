'use client';

import { useEffect } from 'react';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { TRANSACTION_CATEGORIES, TransactionCategory } from '@/models/Transaction';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { format } from 'date-fns';
import { Budget } from '@/models/Budget';

// Form schema with validation
const formSchema = z.object({
  category: z.string({ required_error: 'Category is required' }),
  amount: z.coerce.number().min(0.01, 'Amount must be greater than 0'),
  month: z.string().regex(/^\d{4}-\d{2}$/, 'Month must be in YYYY-MM format'),
  notes: z.string().optional(),
});

type BudgetFormData = Omit<Budget, '_id' | 'createdAt' | 'updatedAt'>;

interface BudgetFormProps {
  onSave: (data: BudgetFormData) => void;
  budget?: Budget | null;
  onCancel: () => void;
}

export default function BudgetForm({ onSave, budget, onCancel }: BudgetFormProps) {
  // Get current month in YYYY-MM format
  const currentMonth = format(new Date(), 'yyyy-MM');

  // Initialize the form with useForm hook
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      category: '',
      amount: 0,
      month: currentMonth,
      notes: '',
    },
  });

  // Set form values when editing a budget
  useEffect(() => {
    if (budget) {
      form.reset({
        category: budget.category,
        amount: budget.amount,
        month: budget.month,
        notes: budget.notes || '',
      });
    }
  }, [budget, form]);

  // Form submission handler
  function onSubmit(values: z.infer<typeof formSchema>) {
    // Convert form values to BudgetFormData
    const budgetData: BudgetFormData = {
      category: values.category as TransactionCategory,
      amount: values.amount,
      month: values.month,
      notes: values.notes
    };
    onSave(budgetData);
    if (!budget) {
      form.reset({
        category: '',
        amount: 0,
        month: currentMonth,
        notes: '',
      });
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        {/* Category field */}
        <FormField
          control={form.control}
          name="category"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Category</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {TRANSACTION_CATEGORIES.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Budget Amount field */}
        <FormField
          control={form.control}
          name="amount"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Budget Amount</FormLabel>
              <FormControl>
                <div className="relative">
                  <span className="absolute left-3 top-2.5">$</span>
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    className="pl-7"
                    {...field}
                    onChange={(e) => field.onChange(parseFloat(e.target.value))}
                  />
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Month field */}
        <FormField
          control={form.control}
          name="month"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Month</FormLabel>
              <FormControl>
                <Input type="month" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Notes field */}
        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Notes (Optional)</FormLabel>
              <FormControl>
                <Textarea placeholder="Add any notes about this budget" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Form actions */}
        <div className="flex justify-end space-x-2">
          <Button variant="outline" onClick={onCancel} type="button">Cancel</Button>
          <Button type="submit">{budget ? 'Update' : 'Create'} Budget</Button>
        </div>
      </form>
    </Form>
  );
}
