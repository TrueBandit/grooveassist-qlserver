export const typeDefs = `#graphql

type Query {
    getAllUsers : [User],
    getUser(id : String) : User,
    login(userLoginObject: UserLoginInput): AuthPayload
}

type Mutation {
    addUser(newUser: UserInput): AuthPayload
    deleteUserById(id: String): String
    generateResponse(promptObj: PromptObjectInput, requestId: String): String
    getRequestID: String
}

type Subscription {
    responseStream(id: String): String
}

type User {
    _id: String,
    fname: String,
    lname: String,
    email: String,
    password: String,
    type: String
}

type AuthPayload {
    token: String
    user: User
}

input UserInput {
    fname: String,
    lname: String,
    email: String,
    password: String,
    type: String
}

input PromptObjectInput {
    artist: String
    bars: String
    genre: String
    level: String
    key: String
}

input UserLoginInput {
    email: String,
    password: String
}

`

