import express, {Request, Response} from "express";
import {NotAuthorizedError, NotFoundError, requireAuth} from "@tixapp/common";
import {Order} from "../models/order";

const router = express.Router()

router.get('/orders/:orderId', requireAuth, async (req: Request, res: Response) => {
    const order = await Order.findById(req.params.orderId).populate('ticket')
    if (!order) {
        throw new NotFoundError()
    }

    if (order.userId !== req.user!.id){
        throw new NotAuthorizedError()
    }

    res.send(order)
})

export {router as showOrderRouter}