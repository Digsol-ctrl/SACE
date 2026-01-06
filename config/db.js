import mongoose from 'mongoose';

async function connectDB(uri) {
    try {
        await mongoose.connect(uri, { dbName: 'sace' });
        console.log('MongoDB connected');
    } catch (err) {
        console.error('MongoDB connection error', err);
        throw err;
    }
}

export { connectDB };
export default connectDB;