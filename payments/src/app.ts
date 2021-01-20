import express, {json, Request, Response} from 'express'
import 'express-async-errors'
import cookieSession from 'cookie-session'

import {currentUser, errorHandler, NotFoundError} from "@tixapp/common";
import {createChargeRouter} from "./routes/new";

const app = express()
app.set('trust proxy', true)
app.use(json())
app.use(cookieSession({
    signed: false,
    secure: process.env.NODE_ENV !== 'test'
}))

app.use(currentUser)
app.use('/api', createChargeRouter)

app.all('*', async (req: Request, res: Response) => {
    throw new NotFoundError()
})

app.use(errorHandler)

export {app}
