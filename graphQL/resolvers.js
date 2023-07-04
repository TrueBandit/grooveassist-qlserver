import 'colors'
import { users } from '../database/users.js'
import { generateAndStream } from './openAIChordsGenerator.js'
import pubSub from './pubsub.js'
import { v4 as uuidv4 } from 'uuid'
import 'dotenv/config'

const resolvers = {
    Query: {
        getAllUsers: () => {
            return users
        },
        getUser: (parent, args) => {
            const id = args.id
            return users.find(user => user.id === id)
        }
    },
    Mutation: {
        addUser: (parent, args) => {
            const user = args.newUser
            users.push(user)
            return users
          },
        deleteUserById: (parent, args) => {
            const id = args.id
            let index = users.findIndex(x => x.id == id)
            if(index >= 0)
            {
                users.splice(index,1)
            }
            return users;
          },
        getRequestID: () => {
            const requestId = uuidv4()
            return requestId
          },    
        generateResponse: async (parent, args) => {
            await generateAndStream(args.promptObj, args.requestId)
            return "stream finished"
          }
    },
    Subscription: {
        responseStream: {
            subscribe: (parent, args) => pubSub.asyncIterator(args.id),
        }
    }
}

export { resolvers }
