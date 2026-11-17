const mongoose = require('mongoose');
require('dotenv').config();
const { User } = require('./models');

const url = process.env.MONGODB_URI || 'mongodb://localhost:27017/CardsDB';

(async () => {
  try {
    await mongoose.connect(url);
    if (await User.exists({ login: 'admin' })) {
      console.log('Admin already exists');
    } else {
      await User.create({
        login: 'admin',
        password: process.env.ADMIN_PASSWORD,
        email: 'admin@example.com',
        role: 'admin'
      });
      console.log('Admin created');
    }
  } catch (err) {
    console.error(err);
  } finally {
    await mongoose.disconnect();
  }
})();
