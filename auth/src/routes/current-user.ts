import express, {Request, Response} from 'express'
import {currentUser} from "@tixapp/common";

const router = express.Router()

router.get('/users/current', currentUser, (req: Request, res: Response) => {
    return res.send({
        user: req.user || null
    })
})

export {router as currentUserRouter}