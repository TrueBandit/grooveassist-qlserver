import 'colors'
import { users } from '../database/users.js'
import { generateAndStream } from './openAIChordsGenerator.js'
import pubSub from './pubSub.js'
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
        generateResponse: async (parent, args) => { 
            await generateAndStream(args.PromptObj)
            return "Generation reached server"
          }
    },
    Subscription: {
        responseStream: {
            subscribe: () => pubSub.asyncIterator(['NEW_RESPONSE']),
        }
    }
}

export { resolvers }
