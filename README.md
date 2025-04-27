# Personal Finance Visualizer

A comprehensive personal finance tracking application built with Next.js, React, shadcn/ui, Recharts, and MongoDB. This application helps you manage your finances by tracking transactions, analyzing spending patterns, setting budgets, and providing visual insights into your financial health.

## 🚀 Live Demo

**[View Live Demo](https://personal-finance-visualizer-alpha-eight.vercel.app/)**

*Replace the URL above with your actual Vercel deployment URL.*

![Personal Finance Visualizer](https://via.placeholder.com/800x400?text=Personal+Finance+Visualizer)

## ✨ Features

### 💰 Transaction Management
- Add, edit, and delete financial transactions
- Categorize transactions (Food, Housing, Entertainment, etc.)
- Mark transactions as income or expense
- Validation using React Hook Form and Zod
- Clean, responsive UI with shadcn/ui components

### 📊 Data Visualization
- Monthly expenses bar chart showing spending over time
- Category-wise pie chart for expense breakdown
- Interactive charts with tooltips and responsive design
- Beautiful data presentation with Recharts

### 📈 Financial Dashboard
- At-a-glance view of financial status
- Total income, expenses, and net balance
- Top spending categories
- Most recent transactions
- Beautifully designed summary cards

### 💼 Budget Management
- Set monthly budgets by category
- Track spending against budgets
- Budget vs. actual comparison charts
- Visual indicators for budget status (under/over budget)
- Monthly budget summary views

## 🛠️ Technology Stack

### Frontend
- **Framework**: [Next.js 15](https://nextjs.org/) with App Router
- **UI Library**: [React 18](https://react.dev/)
- **Component Library**: [shadcn/ui](https://ui.shadcn.com/) - Beautiful, accessible components
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS framework
- **Charts**: [Recharts](https://recharts.org/) - Composable chart library
- **Form Handling**: [React Hook Form](https://react-hook-form.com/) + [Zod](https://zod.dev/) for validation
- **Date Handling**: [date-fns](https://date-fns.org/) - Modern JavaScript date utility library
- **Icons**: [Lucide React](https://lucide.dev/) - Beautiful & consistent icons
- **Notifications**: [Sonner](https://sonner.emilkowal.ski/) - Toast notifications

### Backend
- **API Routes**: Next.js API routes with App Router
- **Database**: [MongoDB](https://www.mongodb.com/) via Mongoose
- **Development**: [mongodb-memory-server](https://github.com/nodkz/mongodb-memory-server) for in-memory database during development
- **Type Safety**: TypeScript for end-to-end type safety

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or later)
- npm or yarn package manager

### Installation

```bash
# Clone the repository
git clone https://github.com/anushka-1807/personal-finance-visualizer.git
cd personal-finance-visualizer

# Install dependencies
npm install

# Run the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the application.

### No Database Setup Required!

This project uses an in-memory MongoDB server for development, so you don't need to:  
- Install MongoDB locally
- Create a MongoDB Atlas account
- Set up connection strings

The database will automatically initialize in memory when you start the application. Perfect for development and testing!

> **Note:** For production deployment, you would want to connect to a persistent MongoDB database. See the Production section below.

## 🧩 Application Structure

```
src/
├── app/                # Next.js App Router
│   ├── api/            # API Routes
│   │   ├── budgets/    # Budget API endpoints
│   │   └── transactions/ # Transaction API endpoints
│   ├── layout.tsx      # Root layout
│   └── page.tsx        # Main application page
├── components/         # React components
│   ├── ui/             # shadcn UI components
│   ├── BudgetForm.tsx  # Budget creation form
│   ├── BudgetList.tsx  # Budget management component
│   ├── BudgetPage.tsx  # Budget page container
│   ├── BudgetVsActualChart.tsx # Budget comparison chart
│   ├── CategoryPieChart.tsx   # Category breakdown chart
│   ├── Dashboard.tsx          # Financial summary dashboard
│   ├── MonthlyExpensesChart.tsx # Monthly expenses chart
│   ├── TransactionForm.tsx    # Transaction form
│   └── TransactionList.tsx    # Transaction listing
├── lib/               # Utility functions
│   └── mongodb.ts     # MongoDB connection setup
├── models/            # Mongoose models
│   ├── Budget.ts      # Budget schema and model
│   └── Transaction.ts # Transaction schema and model
└── styles/            # Global styles
    └── theme.css      # Custom theme variables
```

## 🌐 Production Deployment

For production deployment, follow these steps:

1. **Set up a MongoDB database**:
   - Use MongoDB Atlas (cloud) or set up your own MongoDB server
   - Create a database and get your connection string

2. **Update Environment Variables**:
   - Create a `.env.local` file with your production MongoDB URI:
   ```
   MONGODB_URI=your_production_mongodb_connection_string
   ```
   - Make sure to modify the `src/lib/mongodb.ts` file to use this connection string in production

3. **Deploy on Vercel**:
   - The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new)
   - Configure your environment variables in the Vercel dashboard
   - Deploy directly from your GitHub repository

## 🧪 Future Enhancements

- **User Authentication**: Add login/register functionality
- **Data Export**: Export financial data to CSV/PDF
- **Dark Mode**: Complete dark mode support
- **Mobile App**: React Native version for mobile devices
- **Financial Goals**: Set and track financial goals
- **Recurring Transactions**: Support for recurring bills and income
- **Currency Support**: Multiple currency handling
