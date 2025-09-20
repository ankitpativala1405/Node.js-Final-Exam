const fs = require('fs');
const path = require('path');

console.log('🔄 MongoDB Database Switcher\n');

const options = [
    { name: 'MongoDB Atlas (Cloud)', file: 'config.env' },
    { name: 'Local MongoDB', file: 'local-mongodb.env' }
];

console.log('Choose your database option:');
options.forEach((option, index) => {
    console.log(`${index + 1}. ${option.name}`);
});

// For now, let's try local MongoDB as a fallback
console.log('\n🔄 Switching to Local MongoDB for testing...');

try {
    // Copy local MongoDB config to .env
    const localConfig = fs.readFileSync('local-mongodb.env', 'utf8');
    fs.writeFileSync('.env', localConfig);
    
    console.log('✅ Switched to Local MongoDB configuration');
    console.log('\n📋 Next steps:');
    console.log('1. Make sure MongoDB is installed and running locally');
    console.log('2. Start MongoDB: mongod');
    console.log('3. Test connection: node test-mongodb.js');
    console.log('4. Start app: npm start');
    
} catch (error) {
    console.error('❌ Error switching database:', error.message);
    console.log('\n🔧 Manual setup:');
    console.log('1. Copy local-mongodb.env to .env');
    console.log('2. Install and start local MongoDB');
    console.log('3. Run: npm start');
}
