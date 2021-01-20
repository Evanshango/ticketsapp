import express, {json, Request, Response} from 'express'
import 'express-async-errors'
import cookieSession from 'cookie-session'

import {currentUser, errorHandler, NotFoundError} from "@tixapp/common";
import {createTicketRouter} from './routes/new'
import {showTicketRouter} from "./routes/show";
import {indexTicketRouter} from "./routes";
import {updateTicketRouter} from "./routes/update";

const app = express()
app.set('trust proxy', true)
app.use(json())
app.use(cookieSession({
    signed: false,
    secure: process.env.NODE_ENV !== 'test'
}))

app.use(currentUser)
app.use('/api', createTicketRouter)
app.use('/api', indexTicketRouter)
app.use('/api', showTicketRouter)
app.use('/api', updateTicketRouter)

app.all('*', async (req: Request, res: Response) => {
    throw new NotFoundError()
})

app.use(errorHandler)

export {app}
