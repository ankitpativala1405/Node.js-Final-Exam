require('dotenv').config();
const mongoose = require('mongoose');

console.log('🔗 Testing MongoDB Atlas Connection...\n');

const mongoUri = process.env.MONGODB_URI;
console.log('Connection String:', mongoUri.replace(/\/\/[^:]+:[^@]+@/, '//***:***@')); // Hide credentials

async function testConnection() {
    try {
        console.log('⏳ Connecting to MongoDB Atlas...');
        
        await mongoose.connect(mongoUri, {
            serverSelectionTimeoutMS: 15000,
            connectTimeoutMS: 15000,
            socketTimeoutMS: 15000
        });
        
        console.log('✅ Successfully connected to MongoDB Atlas!');
        console.log('📊 Database:', mongoose.connection.db.databaseName);
        console.log('🌐 Host:', mongoose.connection.host);
        
        // Test creating a simple document
        const testSchema = new mongoose.Schema({
            test: String,
            timestamp: { type: Date, default: Date.now }
        });
        
        const TestModel = mongoose.model('Test', testSchema);
        
        const testDoc = new TestModel({ test: 'Connection test successful' });
        await testDoc.save();
        console.log('✅ Test document created successfully');
        
        // Clean up test document
        await TestModel.deleteOne({ _id: testDoc._id });
        console.log('🧹 Test document cleaned up');
        
        await mongoose.disconnect();
        console.log('✅ Connection closed successfully');
        console.log('\n🎉 Your MongoDB Atlas connection is working perfectly!');
        
    } catch (error) {
        console.error('❌ Connection failed:', error.message);
        
        if (error.message.includes('authentication failed')) {
            console.log('\n🔧 Authentication Issues:');
            console.log('1. Check your username and password in the connection string');
            console.log('2. Make sure the user has read/write permissions');
            console.log('3. Verify the user is not locked or expired');
        } else if (error.message.includes('network')) {
            console.log('\n🌐 Network Issues:');
            console.log('1. Check your internet connection');
            console.log('2. Verify your IP is whitelisted in MongoDB Atlas');
            console.log('3. Check if your firewall is blocking the connection');
        } else if (error.message.includes('timeout')) {
            console.log('\n⏰ Timeout Issues:');
            console.log('1. Check your network connection');
            console.log('2. Try again in a few moments');
            console.log('3. Verify the cluster is running');
        }
        
        console.log('\n📋 Troubleshooting Steps:');
        console.log('1. Go to MongoDB Atlas dashboard');
        console.log('2. Check Database Access - ensure user exists and has permissions');
        console.log('3. Check Network Access - ensure your IP is whitelisted (or use 0.0.0.0/0 for testing)');
        console.log('4. Get the correct connection string from "Connect" button');
        
        process.exit(1);
    }
}

testConnection();
