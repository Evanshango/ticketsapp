import express, {Request, Response} from 'express'
import jwt from 'jsonwebtoken'
import {User} from '../models/user'
import {body} from 'express-validator'
import {BadRequestError, validateRequest} from "@tixapp/common";

const router = express.Router()

router.post('/users/signup', [
    body('email').trim().isEmail().withMessage('Email must be valid'),
    body('password').trim().isLength({min: 6, max: 20}).withMessage('Password must be between 6 and 20 characters')
], validateRequest, async (req: Request, res: Response) => {
    const {email, password} = req.body

    const existingUser = await User.findOne({email})
    if (existingUser) {
        throw new BadRequestError('Email already in use')
    }

    const user = User.build({email, password})
    await user.save()

    const userJWt = jwt.sign({id: user.id, email: user.email}, process.env.JWT_KEY!)

    req.session = {jwt: userJWt}

    return res.status(201).send({
        status: 'success',
        token: userJWt
    })
})

export {router as signupRouter}
