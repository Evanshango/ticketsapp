import express, {Request, Response} from 'express'

const router = express.Router()

router.get('/users/signout', (req: Request, res: Response) => {
    req.session = null

    res.status(200).send({
        status: 'success'
    })
})

export {router as signoutRouter}
