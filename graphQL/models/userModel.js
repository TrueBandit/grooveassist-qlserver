import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
  fname : String,
  lname : String,
  email : String,
  password : String,
  type : String,
});

export default mongoose.model('users', UserSchema);
