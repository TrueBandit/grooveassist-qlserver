export const typeDefs = `#graphql

type Query {
    getRequestID: String
    getAllUsers : [User],
    getUser(id : String) : User,
    login(userLoginObject: UserLoginInput): AuthPayload
    getAllProgressions : [FullProgressionObject],
    getUserProgressions(token: String): [FullProgressionObject]
}

type Mutation {
    addUser(newUser: UserInput): AuthPayload
    deleteUserById(id: String): String
    generateChords(promptObj: PromptObjectInput, requestID: String): String
    saveNewProgression(ProgObj: ProgressionObjectInput, token: String): FullProgressionObject
}

type Subscription {
    generatedProg(id: String): ProgressionObject
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

type FullProgressionObject {
    _id: String,
    userID: String,
    creationTime: CreationTime,
    prog: ProgressionObject
}

type ProgressionObject {
    chords: [Chord],
    explanation: String,
    similar_song: String,
    brief_description: String
}

type Chord {
    chord_name: String,
    bars: String,
    notes: [String]
}

type CreationTime {
    day: String,
    time: String
}

input UserInput {
    fname: String,
    lname: String,
    email: String,
    password: String,
    type: String
}

input PromptObjectInput {
    artist: String,
    bars: String,
    genre: String,
    level: String,
    key: String
}

input UserLoginInput {
    email: String,
    password: String
}

input ChordInput {
    chord_name: String,
    bars: String,
    notes: [String]
}

input ProgressionObjectInput {
    chords: [ChordInput],
    explanation: String,
    similar_song: String,
    brief_description: String
}


`