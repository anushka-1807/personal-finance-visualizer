import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import { Budget } from '@/models/Budget';
import mongoose from 'mongoose';

// Helper function to validate MongoDB ObjectId
function isValidObjectId(id: string) {
  return mongoose.Types.ObjectId.isValid(id);
}

// GET route to fetch a single budget by ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Connect to the database
    await connectToDatabase();

    const { id } = params;
    
    // Validate the ID format
    if (!isValidObjectId(id)) {
      return NextResponse.json(
        { error: 'Invalid budget ID format' },
        { status: 400 }
      );
    }

    // Find the budget by ID
    const budget = await Budget.findById(id);

    // Check if budget exists
    if (!budget) {
      return NextResponse.json(
        { error: 'Budget not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ budget });
  } catch (error) {
    console.error('Error fetching budget:', error);
    return NextResponse.json(
      { error: 'Failed to fetch budget', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// PUT route to update a budget
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Connect to the database
    await connectToDatabase();
    
    const { id } = params;
    
    // Validate the ID format
    if (!isValidObjectId(id)) {
      return NextResponse.json(
        { error: 'Invalid budget ID format' },
        { status: 400 }
      );
    }

    // Parse request body
    const body = await request.json();

    // Validate required fields
    if (!body.category || !body.amount || !body.month) {
      return NextResponse.json(
        { error: 'Category, amount, and month are required fields' },
        { status: 400 }
      );
    }

    // Check for existing budget with the same category and month but different ID
    if (body.category && body.month) {
      const existingBudget = await Budget.findOne({
        category: body.category,
        month: body.month,
        _id: { $ne: id }
      });

      if (existingBudget) {
        return NextResponse.json(
          { error: 'A budget for this category and month already exists' },
          { status: 409 }
        );
      }
    }

    // Find and update the budget
    const updatedBudget = await Budget.findByIdAndUpdate(
      id,
      { $set: body },
      { new: true, runValidators: true }
    );

    // Check if budget exists
    if (!updatedBudget) {
      return NextResponse.json(
        { error: 'Budget not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ budget: updatedBudget });
  } catch (error) {
    console.error('Error updating budget:', error);
    
    // Check for validation errors
    if (error instanceof Error && error.name === 'ValidationError') {
      return NextResponse.json(
        { error: 'Validation error', details: error.message },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to update budget', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// DELETE route to remove a budget
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Connect to the database
    await connectToDatabase();
    
    const { id } = params;
    
    // Validate the ID format
    if (!isValidObjectId(id)) {
      return NextResponse.json(
        { error: 'Invalid budget ID format' },
        { status: 400 }
      );
    }

    // Find and delete the budget
    const deletedBudget = await Budget.findByIdAndDelete(id);

    // Check if budget exists
    if (!deletedBudget) {
      return NextResponse.json(
        { error: 'Budget not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, message: 'Budget deleted successfully' });
  } catch (error) {
    console.error('Error deleting budget:', error);
    return NextResponse.json(
      { error: 'Failed to delete budget', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
