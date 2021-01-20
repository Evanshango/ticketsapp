import express, {Request, Response} from 'express'
import {body} from 'express-validator'
import {User} from '../models/user'
import jwt from 'jsonwebtoken'
import {validateRequest, BadRequestError} from "@tixapp/common";
import {PasswordManager} from '../services/password-manager'

const router = express.Router()

router.post('/users/signin', [
    body('email').isEmail().withMessage('Email must be valid'),
    body('password').trim().notEmpty().withMessage('You must supply a password')
], validateRequest, async (req: Request, res: Response) => {
    const {email, password} = req.body

    const existingUser = await User.findOne({email})
    if (!existingUser) {
        throw new BadRequestError('Invalid credentials')
    }

    const passMatch = await PasswordManager.compare(existingUser.password, password)
    if (!passMatch) {
        throw new BadRequestError('Invalid credentials')
    }

    const userJWt = jwt.sign({id: existingUser.id, email: existingUser.email}, process.env.JWT_KEY!)

    req.session = {jwt: userJWt}

    return res.status(200).send({
        status: 'success',
        token: userJWt
    })
})

export {router as signinRouter}
