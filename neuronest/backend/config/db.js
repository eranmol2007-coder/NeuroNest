const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const uri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/neuronest';
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000,
    });
    console.log(`  MongoDB Connected: ${conn.connection.host}/${conn.connection.name}`);
    return true;
  } catch (err) {
    console.log(`  MongoDB not available: ${err.message}`);
    return false;
  }
};

mongoose.connection.on('error', (err) => {
  console.error(`MongoDB runtime error: ${err.message}`);
});

module.exports = connectDB;
