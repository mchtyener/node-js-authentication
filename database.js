// db.js
const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB bağlantısı başarıyla gerçekleştirildi.');
  } catch (err) {
    console.error('DB bağlanılamadı: ' + err);
    process.exit(1);
  }
};

module.exports = connectDB;
