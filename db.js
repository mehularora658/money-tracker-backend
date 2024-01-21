const mongoose = require('mongoose');
require('dotenv').config()

async function ConnectDb() {
    try {
        await mongoose.connect(process.env.MONGO_DATABASE_URL, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        console.log('Connected to MongoDB');
    } catch (error) {
        console.error('Error connecting to MongoDB:', error.message);
    }
}

module.exports = ConnectDb;
