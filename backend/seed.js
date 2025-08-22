
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';

dotenv.config();

const defaults = [];

async function run() {
  if (!process.env.ATLASDB_URL) throw new Error('ATLASDB_URL missing');
  await mongoose.connect(process.env.ATLASDB_URL);
  const count = await User.countDocuments();
  if (count === 0) {
    await User.insertMany(defaults.map(name => ({ name })));
    console.log('Inserted default users');
  } else {
    console.log('Users already present, skipping.');
  }
  await mongoose.disconnect();
}
run().catch(e => { console.error(e); process.exit(1); });
