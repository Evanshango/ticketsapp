import {MongoMemoryServer} from 'mongodb-memory-server'
import request from 'supertest'
import mongoose from 'mongoose'
import {app} from "../app";

declare global {
    namespace NodeJS{
        interface Global{
            signin(): Promise<string[]>
        }
    }
}

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
    const collections = await mongoose.connection.db.collections()

    for (let col of collections) {
        await col.deleteMany({})
    }
})

afterAll(async () => {
    await mongo.stop()
    await mongoose.connection.close()
})

global.signin = async () => {
    const email = 'test@test.com'
    const password = 'password'

    const response = await request(app)
        .post('/api/users/signup')
        .send({
            email, password
        }).expect(201)

    return response.get('Set-Cookie')
}
