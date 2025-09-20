const fs = require('fs');
const path = require('path');

console.log('🚀 Setting up Blog Project...\n');

// Create .env file if it doesn't exist
const envPath = path.join(__dirname, '.env');
const envExamplePath = path.join(__dirname, 'config.env');

if (!fs.existsSync(envPath)) {
    if (fs.existsSync(envExamplePath)) {
        fs.copyFileSync(envExamplePath, envPath);
        console.log('✅ Created .env file from config.env');
    } else {
        const envContent = `# Environment Configuration
NODE_ENV=development
PORT=3000

# Database Configuration
MONGODB_URI=mongodb://localhost:27017/blog_project

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production-${Date.now()}
JWT_EXPIRES_IN=7d

# Cookie Configuration
COOKIE_SECURE=false
COOKIE_SAME_SITE=lax

# Application Configuration
APP_NAME=BlogHub
APP_URL=http://localhost:3000`;

        fs.writeFileSync(envPath, envContent);
        console.log('✅ Created .env file with default configuration');
    }
} else {
    console.log('ℹ️  .env file already exists');
}

// Check if MongoDB is running
const mongoose = require('mongoose');

async function checkMongoDB() {
    try {
        // Load environment variables
        require('dotenv').config();
        
        const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/blog_project';
        console.log('🔗 Testing MongoDB connection...');
        
        await mongoose.connect(mongoUri, {
            serverSelectionTimeoutMS: 10000
        });
        console.log('✅ MongoDB connection successful');
        await mongoose.disconnect();
    } catch (error) {
        console.log('❌ MongoDB connection failed:', error.message);
        if (error.message.includes('ECONNREFUSED')) {
            console.log('   This appears to be a local MongoDB connection issue.');
            console.log('   If using MongoDB Atlas, check your connection string.');
        } else {
            console.log('   Please check your MongoDB connection string and credentials.');
        }
    }
}

console.log('\n📋 Setup Instructions:');
console.log('1. Make sure MongoDB is running on your system');
console.log('2. Update .env file with your configuration if needed');
console.log('3. Run: npm start');
console.log('4. Open http://localhost:3000 in your browser\n');

checkMongoDB().then(() => {
    console.log('\n🎉 Setup complete! You can now start the application.');
}).catch(() => {
    console.log('\n⚠️  Setup completed with warnings. Please check MongoDB connection.');
});
