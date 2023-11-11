import UserModel from './userModel.js';

const getAllUsers = () => {
  return UserModel.find({}).exec();
};

const getUserById = (params) => {
  let id = params.id;
  return UserModel.findById(id).exec();
};

const findUserAndAuth = (params) => {
  let email = params.email;
  let password = params.password;
  return UserModel.findOne({ "email": email, "password": password });
};

const addUser = async (params) => {
  let user = params.user;
  // Check if a user with the provided email already exists
  const existingUser = await UserModel.findOne({ "email": user.email }).exec();
  if (existingUser) {
    // If a user exists, throw an error
    throw new Error('A user with this email already exists');
  }
  // If no user exists, proceed to create a new user
  let newUser = new UserModel(user);
  await newUser.save();
  return newUser._id;
}


const updateUser = async (params) =>
{
  const user = params.user;
  const id = params.id;
  await UserModel.findByIdAndUpdate(id, user)
  return "Updated!"
}

const deleteUser = async (params) =>
{
  const id = params.id;
  await UserModel.findByIdAndDelete(id)
  return "Deleted!"
}

export { getAllUsers, getUserById, addUser, updateUser, deleteUser, findUserAndAuth };
