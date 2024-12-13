import { MongoClient, ServerApiVersion } from 'mongodb';
import mongoose from 'mongoose';
import { config } from '../../config';

const client = new MongoClient(config.database.uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

let isConnected = false;

export async function connectDatabase() {
  if (isConnected) {
    return;
  }

  try {
    // Connect using MongoDB native client first to ensure the connection is valid
    await client.connect();
    await client.db("admin").command({ ping: 1 });
    console.log("✅ MongoDB connection validated");
    
    // Then connect with Mongoose for the application
    await mongoose.connect(config.database.uri);
    isConnected = true;
    console.log('✅ Connected to MongoDB successfully');

    // Create admin user if it doesn't exist
    const db = mongoose.connection.db;
    const adminExists = await db.collection('users').findOne({ username: 'admin' });
    
    if (!adminExists) {
      const { hashPassword } = await import('../auth/password.service');
      const hashedPassword = await hashPassword('20140457764');
      
      await db.collection('users').insertOne({
        username: 'admin',
        password: hashedPassword,
        role: 'admin',
        createdAt: new Date(),
        updatedAt: new Date()
      });
      
      console.log('✅ Admin user created successfully');
    }
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    isConnected = false;
    throw error;
  } finally {
    // Close the native client as we'll use mongoose from here
    await client.close();
  }
}

mongoose.connection.on('disconnected', () => {
  isConnected = false;
  console.log('❌ MongoDB disconnected');
});

mongoose.connection.on('error', (err) => {
  isConnected = false;
  console.error('❌ MongoDB error:', err);
});

export function getConnectionStatus() {
  return isConnected;
}