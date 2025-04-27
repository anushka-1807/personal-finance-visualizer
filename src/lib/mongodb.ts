import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

// Check for production MongoDB URI
const MONGODB_URI = process.env.MONGODB_URI;

// Add this to make TypeScript happy with the global mongoose and MongoMemoryServer type
declare global {
  var mongoose: any;
  var mongoMemoryServer: MongoMemoryServer | null;
}

// Use cached connection if available to prevent multiple connections during development
let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

async function connectToDatabase() {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
    };

    // Check if we have a production MongoDB URI
    if (MONGODB_URI) {
      // Use the provided MongoDB URI for production
      console.log('Connecting to production MongoDB...');
      cached.promise = mongoose.connect(MONGODB_URI, opts)
        .then((mongoose) => {
          console.log('Production MongoDB connected successfully!');
          return mongoose;
        })
        .catch(err => {
          console.error('Production MongoDB connection error:', err);
          throw err;
        });
    } else {
      // Use in-memory MongoDB for development
      console.log('No MONGODB_URI found, using in-memory database for development');
      
      // Check if we already have a MongoDB Memory Server running
      if (!global.mongoMemoryServer) {
        console.log('Starting MongoDB Memory Server...');
        // Create a new MongoDB Memory Server
        global.mongoMemoryServer = await MongoMemoryServer.create();
      }
      
      // Get the connection string for the in-memory server
      const mongoUri = global.mongoMemoryServer.getUri();
      console.log('Connecting to MongoDB Memory Server:', mongoUri);
      
      cached.promise = mongoose.connect(mongoUri, opts)
        .then((mongoose) => {
          console.log('MongoDB Memory Server connected successfully!');
          return mongoose;
        })
        .catch(err => {
          console.error('MongoDB Memory Server connection error:', err);
          throw err;
        });
    }
  }

  try {
    cached.conn = await cached.promise;
    return cached.conn;
  } catch (error) {
    console.error('Failed to connect to MongoDB:', error);
    throw error;
  }
}

export default connectToDatabase;
