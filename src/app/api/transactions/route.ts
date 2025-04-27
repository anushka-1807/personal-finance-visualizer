import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Transaction from '@/models/Transaction';
import mongoose from 'mongoose';

// GET all transactions
export async function GET() {
  try {
    console.log('GET /api/transactions: Connecting to database');
    await connectToDatabase();
    
    console.log('GET /api/transactions: Fetching transactions');
    const transactions = await Transaction.find({}).sort({ date: -1 });
    
    console.log(`GET /api/transactions: Found ${transactions.length} transactions`);
    return NextResponse.json(transactions);
  } catch (error) {
    console.error('GET /api/transactions: Error fetching transactions', error);
    
    // Check if it's a MongoDB connection error
    if (error instanceof mongoose.Error.MongooseServerSelectionError) {
      return NextResponse.json(
        { error: 'Failed to connect to the database. Please make sure MongoDB is running.' },
        { status: 500 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to fetch transactions' },
      { status: 500 }
    );
  }
}

// POST a new transaction
export async function POST(request: NextRequest) {
  try {
    console.log('POST /api/transactions: Parsing request body');
    const body = await request.json();
    
    console.log('POST /api/transactions: Connecting to database');
    await connectToDatabase();
    
    console.log('POST /api/transactions: Creating transaction', body);
    const transaction = await Transaction.create(body);
    
    console.log('POST /api/transactions: Transaction created successfully', transaction);
    return NextResponse.json(transaction, { status: 201 });
  } catch (error: unknown) {
    console.error('POST /api/transactions: Error creating transaction', error);
    
    // Check for validation errors
    if (error instanceof Error && 'name' in error && error.name === 'ValidationError' && 'errors' in error) {
      const validationErrors = Object.values((error as {errors: {message: string}[]}).errors).map((err) => err.message);
      return NextResponse.json(
        { error: 'Validation failed', details: validationErrors },
        { status: 400 }
      );
    }
    
    // Check for MongoDB connection errors
    if (error instanceof mongoose.Error.MongooseServerSelectionError) {
      return NextResponse.json(
        { error: 'Failed to connect to the database. Please make sure MongoDB is running.' },
        { status: 500 }
      );
    }
    
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create transaction' },
      { status: 500 }
    );
  }
}
