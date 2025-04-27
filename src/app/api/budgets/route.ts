import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import { Budget } from '@/models/Budget';

// GET route to fetch all budgets
export async function GET(req: NextRequest) {
  try {
    // Connect to the database
    await connectToDatabase();

    // Get query parameters for filtering
    const { searchParams } = new URL(req.url);
    const month = searchParams.get('month');
    const category = searchParams.get('category');

    // Build query object based on provided filters
    const query: any = {};
    if (month) query.month = month;
    if (category) query.category = category;

    // Fetch budgets with optional filters
    const budgets = await Budget.find(query).sort({ category: 1 });

    return NextResponse.json({ budgets });
  } catch (error) {
    console.error('Error fetching budgets:', error);
    return NextResponse.json(
      { error: 'Failed to fetch budgets', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// POST route to create a new budget
export async function POST(req: NextRequest) {
  try {
    // Connect to the database
    await connectToDatabase();

    // Parse request body
    const body = await req.json();

    // Validate required fields
    if (!body.category || !body.amount || !body.month) {
      return NextResponse.json(
        { error: 'Category, amount, and month are required fields' },
        { status: 400 }
      );
    }

    // Check for existing budget for this category and month
    const existingBudget = await Budget.findOne({
      category: body.category,
      month: body.month,
    });

    // If budget already exists, return an error
    if (existingBudget) {
      return NextResponse.json(
        { error: 'A budget for this category and month already exists' },
        { status: 409 }
      );
    }

    // Create new budget
    const newBudget = await Budget.create(body);

    return NextResponse.json({ budget: newBudget }, { status: 201 });
  } catch (error) {
    console.error('Error creating budget:', error);
    
    // Check for validation errors
    if (error instanceof Error && error.name === 'ValidationError') {
      return NextResponse.json(
        { error: 'Validation error', details: error.message },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to create budget', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
