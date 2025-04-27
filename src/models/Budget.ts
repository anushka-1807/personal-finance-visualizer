import mongoose, { Schema } from 'mongoose';
import { TRANSACTION_CATEGORIES, TransactionCategory } from './Transaction';

export interface Budget {
  _id?: string;
  category: TransactionCategory;
  amount: number;
  month: string; // Format: YYYY-MM
  notes?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

// Create a schema for Budget
const BudgetSchema = new Schema<Budget>(
  {
    category: {
      type: String,
      required: [true, 'Category is required'],
      enum: TRANSACTION_CATEGORIES,
    },
    amount: {
      type: Number,
      required: [true, 'Budget amount is required'],
      min: [0, 'Budget amount must be positive'],
    },
    month: {
      type: String,
      required: [true, 'Month is required'],
      match: [/^\d{4}-\d{2}$/, 'Month format must be YYYY-MM'],
    },
    notes: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

// Create a compound index to ensure uniqueness of category+month
BudgetSchema.index({ category: 1, month: 1 }, { unique: true });

// Export the Budget model if it doesn't already exist
// Use optional chaining to handle cases where mongoose.models might be undefined
export const Budget = mongoose.models?.Budget || mongoose.model<Budget>('Budget', BudgetSchema);
