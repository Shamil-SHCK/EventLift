import 'dotenv/config';
import mongoose from 'mongoose';

async function test() {
  await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/sponsorship_platform');
  const user = await mongoose.connection.db.collection('users').findOne({ username: { $ne: null } });
  
  if (!user) {
    console.log("No user with username found");
    process.exit(0);
  }

  console.log("Found username:", user.username);
  
  const res = await fetch('http://localhost:5000/api/profile/' + user.username);
  if (!res.ok) {
     const data = await res.json();
     console.log("API error response:", data);
  } else {
     const data = await res.json();
     console.log("API response keys:", Object.keys(data));
  }
  process.exit(0);
}
test().catch(console.error);
