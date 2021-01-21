import express, {json, Request, Response} from 'express'
import 'express-async-errors'
import cookieSession from 'cookie-session'

import {currentUser, errorHandler, NotFoundError} from "@tixapp/common";

import {createOrderRouter} from "./routes/new";
import {indexOrderRouter} from "./routes";
import {showOrderRouter} from "./routes/show";
import {cancelOrderRouter} from "./routes/cancel";

const app = express()

app.set('trust proxy', true)
app.use(json())
app.use(cookieSession({
    signed: false,
    // secure: process.env.NODE_ENV !== 'test'
    secure: false
}))

app.use(currentUser)
app.use('/api', createOrderRouter)
app.use('/api', indexOrderRouter)
app.use('/api', showOrderRouter)
app.use('/api', cancelOrderRouter)

app.all('*', async (req: Request, res: Response) => {
    throw new NotFoundError()
})

app.use(errorHandler)

export {app}
