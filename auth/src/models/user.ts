import mongoose from 'mongoose'
import {PasswordManager} from '../services/password-manager'

// An interface that describes the properties required to create a new user
interface IUserAttrs {
    email: string,
    password: string
}

// An interface that describes the properties that a user model has
interface IUserModel extends mongoose.Model<IUserDoc> {
    build(attrs: IUserAttrs): IUserDoc
}

// An interface that describes the properties that a user document has
interface IUserDoc extends mongoose.Document {
    email: string,
    password: string
}

const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        lowercase: true,
    },
    password: {
        type: String,
        required: true
    }
}, {
    toJSON: {
        transform(doc, ret) {
            ret.id = ret._id
            delete ret._id
            delete ret.password
            delete ret.__v
        }
    }
})

userSchema.statics.build = (attrs: IUserAttrs) => (new User(attrs))

userSchema.pre('save', async function (done) {
    if (this.isModified('password')) {
        const hashedPass = await PasswordManager.toHash(this.get('password'))
        this.set('password', hashedPass)
    }
    done()
})

const User = mongoose.model<IUserDoc, IUserModel>('User', userSchema)

export {User}
