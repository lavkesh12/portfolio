// Quick script to reset the database with new seed data
const mongoose = require('mongoose');
require('dotenv').config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/portfolio';

async function reset() {
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB');
    await mongoose.connection.db.dropDatabase();
    console.log('Database dropped');
    await mongoose.disconnect();
    console.log('Done! Start the server to re-seed with new data.');
    process.exit(0);
}

reset().catch(err => { console.error(err); process.exit(1); });
