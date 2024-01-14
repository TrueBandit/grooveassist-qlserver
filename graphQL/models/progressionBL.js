import ProgressionModel from './progressionModel.js';

const getAllProgressions = (params) => {
    return ProgressionModel.find({}).exec();
};

const findUserProgressions = (params) => {
    let userID = params.id;
    return ProgressionModel.find({ "userID": userID }).exec()
};

const saveUserProgression = async (params) => {
    let newProg = new ProgressionModel(params.newProg);
    await newProg.save();
    return newProg._id;
};

const deleteProgression = async (params) => {
    const id = params.id;
    await ProgressionModel.findByIdAndDelete(id)
    return "Deleted!"
};

export { getAllProgressions, findUserProgressions, saveUserProgression, deleteProgression };
