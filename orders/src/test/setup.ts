import {MongoMemoryServer} from 'mongodb-memory-server'
import mongoose from 'mongoose'
import jwt from 'jsonwebtoken'

declare global {
    namespace NodeJS{
        interface Global{
            signin(): string[]
        }
    }
}
jest.mock('../nats-wrapper')
let mongo: any
beforeAll(async () => {
    process.env.JWT_KEY = 'some_random_string'
    mongo = new MongoMemoryServer()
    const mongoUri = await mongo.getUri()

    await mongoose.connect(mongoUri, {
        useNewUrlParser: true,
        useUnifiedTopology: true
    })
})

beforeEach(async () => {
    jest.clearAllMocks()
    const collections = await mongoose.connection.db.collections()

    for (let col of collections) {
        await col.deleteMany({})
    }
})

afterAll(async () => {
    await mongo.stop()
    await mongoose.connection.close()
})

global.signin = () => {
    // Build a JWt payload. {id, email, iat}
    const payload = {
        id: new mongoose.Types.ObjectId().toHexString(),
        email: 'test@test.com'
    }
    // Create the JWt
    const token = jwt.sign(payload, process.env.JWT_KEY!)
    // Build a session object
    const session = {jwt: token}
    // Turn that session into JSON
    const sessionJSON = JSON.stringify(session)
    // Take the JSON and encode it as base64
    const base64 = Buffer.from(sessionJSON).toString('base64')
    // Return a string(cookie) with encoded data
    return [`express:sess=${base64}`]
}
