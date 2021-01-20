import express, {Request, Response} from "express";
import {requireAuth} from "@tixapp/common";
import {Order} from "../models/order";

const router = express.Router()

router.get('/orders', requireAuth, async (req: Request, res: Response) => {
    const orders = await Order.find({userId: req.user!.id}).populate('ticket')

    res.send(orders)
})

export {router as indexOrderRouter}