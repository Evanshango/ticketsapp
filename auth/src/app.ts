import express, {json} from 'express'
import 'express-async-errors'
import cookieSession from 'cookie-session'

import {currentUserRouter} from "./routes/current-user";
import {signinRouter} from "./routes/signin";
import {signupRouter} from "./routes/signup";
import {signoutRouter} from "./routes/signout";
import {errorHandler, NotFoundError} from "@tixapp/common";

const app = express()
app.set('trust proxy', true)
app.use(json())
app.use(cookieSession({
    signed: false,
    // secure: process.env.NODE_ENV !== 'test'
    secure: false
}))

app.use('/api', signinRouter)
app.use('/api', signupRouter)
app.use('/api', signoutRouter)
app.use('/api', currentUserRouter)

app.all('*', async (req, res) => {
    throw new NotFoundError()
})

app.use(errorHandler)

export {app}
