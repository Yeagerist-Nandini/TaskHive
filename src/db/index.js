import mongoose from "mongoose";

const connectDB = async() => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log("connected to mongodb");
    } catch (error) {
        console.error("Mongodb connection failed",error);
    }
}

export default connectDB;