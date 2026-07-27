const mongoose = require('mongoose');
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 3000
    });
    console.log(`\n MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.log('\n MongoDB direct connection failed. Initializing MongoDB Memory Server...');
    try {
      const { MongoMemoryServer } = require('mongodb-memory-server');
      const mongod = await MongoMemoryServer.create();
      const uri = mongod.getUri();
      const conn = await mongoose.connect(uri);
      console.log(`\n MongoDB Memory Server Connected: ${conn.connection.host}`);
    } catch (memErr) {
      console.error('Failed to start MongoDB Memory Server:', memErr);
      process.exit(1);
    }
  }
};
module.exports = connectDB;