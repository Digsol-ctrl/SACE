import mongoose from 'mongoose';

async function connectDB(uri) {
    try {
        // sensible defaults and shorter server selection timeout for faster feedback
        await mongoose.connect(uri, {
            dbName: 'sace',
            family: 4,
            connectTimeoutMS: 10000,
            serverSelectionTimeoutMS: 10000,
            socketTimeoutMS: 45000,
            // useUnifiedTopology and useNewUrlParser are defaults in modern mongoose
        });
        console.log('MongoDB connected');
    } catch (err) {
        console.error('MongoDB connection error —', err && err.message ? err.message : err);
        if (err && err.stack) console.error(err.stack);
        throw err;
    }
}

export { connectDB };
export default connectDB;