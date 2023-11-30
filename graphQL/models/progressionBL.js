import ProgressionModel from './progressionModel.js';

const getAllProgressions = (params) => {
    return ProgressionModel.find({}).exec();
};

const getUserProgressions = (params) => {
    let userID = params.id;
    return ProgressionModel.find({ "userID": userID }).exec()
};

export { getAllProgressions, getUserProgressions };
