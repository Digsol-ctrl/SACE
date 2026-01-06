import mongoose from "mongoose";

const serviceSchema = new mongoose.Schema({
    title: {type: String, required: true},
    slug: { type: String, required: true, unique: true },
    description: { type: String },
    image: { type: String },
    createdAt: { type: Date, default: Date.now }
})


export default mongoose.models.Service || mongoose.model('Service', serviceSchema);
