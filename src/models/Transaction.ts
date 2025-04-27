import mongoose, { Schema, Document } from 'mongoose';

// Define available categories
export const TRANSACTION_CATEGORIES = [
  'Food & Dining',
  'Shopping',
  'Housing',
  'Transportation',
  'Entertainment',
  'Healthcare',
  'Education',
  'Travel',
  'Personal Care',
  'Utilities',
  'Subscriptions',
  'Gifts & Donations',
  'Income',
  'Investments',
  'Other'
] as const;

// TypeScript type for categories
export type TransactionCategory = typeof TRANSACTION_CATEGORIES[number];

export interface ITransaction extends Document {
  amount: number;
  date: Date;
  description: string;
  category: TransactionCategory; // Required in Stage 2
  isExpense: boolean; // To differentiate income from expenses
  createdAt: Date;
  updatedAt: Date;
}

const TransactionSchema: Schema = new Schema(
  {
    amount: {
      type: Number,
      required: [true, 'Amount is required'],
    },
    date: {
      type: Date,
      required: [true, 'Date is required'],
      default: Date.now,
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true,
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      enum: TRANSACTION_CATEGORIES,
      default: 'Other',
    },
    isExpense: {
      type: Boolean,
      default: true, // Default to expenses
    },
  },
  {
    timestamps: true,
  }
);

// Check if mongoose.models exists before accessing it
// This prevents errors during hot reloading in development
const Transaction = mongoose.models?.Transaction || mongoose.model<ITransaction>('Transaction', TransactionSchema);

export default Transaction;
