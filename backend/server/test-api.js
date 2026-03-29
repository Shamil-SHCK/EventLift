import 'dotenv/config';
import mongoose from 'mongoose';
import User from './models/User.js';
import jwt from 'jsonwebtoken';

const run = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        const user = await User.findById('695b520a1e0bb31c6d1c7c91');
        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '30d' });
        
        console.log("Token:", token.substring(0, 20) + '...');
        
        const response = await fetch('http://localhost:5000/api/users/clubs', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        const data = await response.json();
        console.log("Status:", response.status);
        console.log("Data length:", data?.length);
        if (data?.length > 0) {
            console.log("Sample ID:", data[0]._id);
            console.log("Sample club name:", data[0].profile?.clubName);
        } else {
            console.log("Response data:", data);
        }
    } catch (err) {
        console.error("Error:", err);
    } finally {
        mongoose.disconnect();
    }
}
run();
