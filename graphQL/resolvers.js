import 'colors';
import { generateAndStream } from '../coreFeatures/openAIChordsGenerator.js';
import { authController } from '../configs/authController.js';
import pubSub from '../configs/pubsub.js';
import { v4 as uuidv4 } from 'uuid';
import 'dotenv/config';

// Import user-related functions from UserBL
import { getAllUsers, getUserById, addUser, deleteUser } from './models/userBL.js';

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

export { resolvers };
