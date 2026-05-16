const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../.env') });

async function testConnection() {
  console.log('Testing MongoDB connection...');
  console.log('URI:', process.env.MONGODB_URI.replace(/:([^@]+)@/, ':****@'));
  
  try {
    const uri = 'mongodb+srv://simonjay710_db_user:UGF9rF8yyaYU26So@cluster0.jpzhzik.mongodb.net/catchme-ai';
    await mongoose.connect(uri, {
      family: 4
    });
    console.log('✅ Connection successful!');
    
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log('Collections:', collections.map(c => c.name));
    
    await mongoose.disconnect();
  } catch (err) {
    console.error('❌ Connection failed:');
    console.error(err);
  }
}

testConnection();
