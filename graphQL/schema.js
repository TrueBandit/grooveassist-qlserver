export const typeDefs = `#graphql

type Query {
    getAllUsers : [User],
    getUser(id : Int) : User
}

type Mutation {
    addUser(newUser: UserInput): [User]
    deleteUserById(id: Int): [User]
    generateResponse(PromptObj:PromptObjectInput): String
}

type Subscription {
    responseStream: String
}

type User {
    id: Int
    name: String
    age: Int
}

input UserInput {
    id: Int
    name: String
    age: Int
}

input PromptObjectInput {
    artist : String
    bars : String
    genre : String
    level : String
    key : String
}

`