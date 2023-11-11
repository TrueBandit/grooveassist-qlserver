import mongoose from 'mongoose';
import 'dotenv/config'
import 'colors'

mongoose.set("strictQuery", false);

const atlas_uri = process.env.ATLAS_URI

const connectDB = () => {
	mongoose
        .connect(atlas_uri)
		.then(() => console.log(`💽 ${'Connected to MongoDB Atlas Database.'.blue}`))
		.catch((error) => console.log(error));
};

export default connectDB;


