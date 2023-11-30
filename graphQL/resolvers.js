import 'colors';
import 'dotenv/config';

import { generateChords } from '../coreFeatures/ChordsGenerator.js';
import { authController } from '../configs/authController.js';
import { getAllUsers, getUserById, addUser, deleteUser } from './models/userBL.js';
import { getAllProgressions, getUserProgressions } from './models/progressionBL.js';


const resolvers = {
    Query: {
        getAllUsers: () => getAllUsers(),
        getUser: (parent, args) => getUserById({ id: args.id }),
        login: async (parent, args) => {
            try {
                return await authController.authenticate(args.userLoginObject);
            } catch (error) {
                // Catch the error if no user found
                throw new Error(error.message);
            }
        },
        getAllProgressions: () => getAllProgressions(),
        getUserProgressions: (parent, args) => getUserProgressions({ id: args.id }),
    },
    Mutation: {
        addUser: async (parent, args) => {
            try {
                const userId = await addUser({ user: args.newUser });
                const token = authController.generateToken(userId);  // Generate token for new user
                const newUser = {
                    _id: userId,
                    ...args.newUser
                }
                return {
                    token,
                    user: newUser
                };
            } catch (error) {
                // Catch the error if the email already exists
                throw new Error(error.message);
            }
        },
        deleteUserById: (parent, args) => {
            return deleteUser({ id: args.id });
        },
        generateChords: async (parent, args) => {
            try {
                const progression = await generateChords(args.promptObj);
                return progression;
            } catch (error) {
                throw new Error(error.message);
            }
        }
    }
};

export { resolvers };


/*

import pubSub from '../configs/pubsub.js';
import { v4 as uuidv4 } from 'uuid';
import { generateAndStream } from '../coreFeatures/ChordsGeneratorStream.js';

const resolvers = {
    
    Mutation: {
        getRequestID: () => {
            const requestId = uuidv4();
            return requestId;
        },
        generateResponse: async (parent, args) => {
            await generateAndStream(args.promptObj, args.requestId);
            return "stream finished";
        }
    },
    Subscription: {
        responseStream: {
            subscribe: (parent, args) => pubSub.asyncIterator(args.id),
        }
        
    }
};


*/