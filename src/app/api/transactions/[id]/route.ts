import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Transaction from '@/models/Transaction';
import mongoose from 'mongoose';

interface RouteParams {
  params: {
    id: string;
  };
}

// Helper to validate MongoDB ObjectId
function isValidObjectId(id: string): boolean {
  return mongoose.Types.ObjectId.isValid(id);
}

// GET a single transaction
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = params;
    
    if (!isValidObjectId(id)) {
      return NextResponse.json(
        { error: 'Invalid transaction ID format' },
        { status: 400 }
      );
    }
    
    console.log(`GET /api/transactions/${id}: Connecting to database`);
    await connectToDatabase();
    
    console.log(`GET /api/transactions/${id}: Finding transaction`);
    const transaction = await Transaction.findById(id);
    
    if (!transaction) {
      console.log(`GET /api/transactions/${id}: Transaction not found`);
      return NextResponse.json(
        { error: 'Transaction not found' },
        { status: 404 }
      );
    }
    
    console.log(`GET /api/transactions/${id}: Transaction found`, transaction);
    return NextResponse.json(transaction);
  } catch (error) {
    console.error(`GET /api/transactions/[id]: Error fetching transaction`, error);
    
    // Check for MongoDB connection errors
    if (error instanceof mongoose.Error.MongooseServerSelectionError) {
      return NextResponse.json(
        { error: 'Failed to connect to the database. Please make sure MongoDB is running.' },
        { status: 500 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to fetch transaction' },
      { status: 500 }
    );
  }
}

// PUT to update a transaction
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = params;
    
    if (!isValidObjectId(id)) {
      return NextResponse.json(
        { error: 'Invalid transaction ID format' },
        { status: 400 }
      );
    }
    
    console.log(`PUT /api/transactions/${id}: Parsing request body`);
    const body = await request.json();
    
    console.log(`PUT /api/transactions/${id}: Connecting to database`);
    await connectToDatabase();
    
    console.log(`PUT /api/transactions/${id}: Updating transaction`, body);
    const transaction = await Transaction.findByIdAndUpdate(
      id,
      body,
      { new: true, runValidators: true }
    );
    
    if (!transaction) {
      console.log(`PUT /api/transactions/${id}: Transaction not found`);
      return NextResponse.json(
        { error: 'Transaction not found' },
        { status: 404 }
      );
    }
    
    console.log(`PUT /api/transactions/${id}: Transaction updated successfully`, transaction);
    return NextResponse.json(transaction);
  } catch (error: any) {
    console.error(`PUT /api/transactions/[id]: Error updating transaction`, error);
    
    // Check for validation errors
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map((err: any) => err.message);
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
      { error: error.message || 'Failed to update transaction' },
      { status: 500 }
    );
  }
}

// DELETE a transaction
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = params;
    
    if (!isValidObjectId(id)) {
      return NextResponse.json(
        { error: 'Invalid transaction ID format' },
        { status: 400 }
      );
    }
    
    console.log(`DELETE /api/transactions/${id}: Connecting to database`);
    await connectToDatabase();
    
    console.log(`DELETE /api/transactions/${id}: Deleting transaction`);
    const transaction = await Transaction.findByIdAndDelete(id);
    
    if (!transaction) {
      console.log(`DELETE /api/transactions/${id}: Transaction not found`);
      return NextResponse.json(
        { error: 'Transaction not found' },
        { status: 404 }
      );
    }
    
    console.log(`DELETE /api/transactions/${id}: Transaction deleted successfully`);
    return NextResponse.json({ message: 'Transaction deleted successfully' });
  } catch (error) {
    console.error(`DELETE /api/transactions/[id]: Error deleting transaction`, error);
    
    // Check for MongoDB connection errors
    if (error instanceof mongoose.Error.MongooseServerSelectionError) {
      return NextResponse.json(
        { error: 'Failed to connect to the database. Please make sure MongoDB is running.' },
        { status: 500 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to delete transaction' },
      { status: 500 }
    );
  }
}
