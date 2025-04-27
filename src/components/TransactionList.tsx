'use client';

import { format } from 'date-fns';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Edit, Trash2, TrendingDown, TrendingUp } from 'lucide-react';
import { TransactionCategory } from '@/models/Transaction';

interface Transaction {
  _id: string;
  amount: number;
  date: string;
  description: string;
  category: TransactionCategory;
  isExpense: boolean;
}

interface TransactionListProps {
  transactions: Transaction[];
  isLoading: boolean;
  onEdit: (transaction: Transaction) => void;
  onDelete: (id: string) => void;
}

export default function TransactionList({ 
  transactions, 
  isLoading, 
  onEdit, 
  onDelete 
}: TransactionListProps) {
  if (isLoading) {
    return <div className="flex justify-center my-8">Loading transactions...</div>;
  }

  if (transactions.length === 0) {
    return <div className="text-center my-8 text-muted-foreground">No transactions yet. Add your first one!</div>;
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Date</TableHead>
            <TableHead>Category</TableHead>
            <TableHead>Description</TableHead>
            <TableHead className="text-right">Amount ($)</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {transactions.map((transaction) => (
            <TableRow key={transaction._id}>
              <TableCell>{format(new Date(transaction.date), 'MMM dd, yyyy')}</TableCell>
              <TableCell>
                <Badge variant="outline" className="font-normal">
                  {transaction.category}
                </Badge>
              </TableCell>
              <TableCell>{transaction.description}</TableCell>
              <TableCell className="text-right font-medium">
                <div className="flex items-center justify-end gap-1">
                  {transaction.isExpense ? 
                    <TrendingDown className="h-4 w-4 text-red-500" /> : 
                    <TrendingUp className="h-4 w-4 text-green-500" />
                  }
                  <span className={transaction.isExpense ? 'text-red-600' : 'text-green-600'}>
                    ${transaction.amount.toFixed(2)}
                  </span>
                </div>
              </TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onEdit(transaction)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onDelete(transaction._id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
