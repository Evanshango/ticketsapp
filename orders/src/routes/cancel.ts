import express, {Request, Response} from "express";
import {Order} from "../models/order";
import {NotAuthorizedError, NotFoundError, OrderStatus, requireAuth} from "@tixapp/common";
import {natsWrapper} from "../nats-wrapper";
import {OrderCancelledPublisher} from "../events/publishers/order-cancelled-publisher";

const router = express.Router()

router.patch('/orders/:orderId', requireAuth, async (req: Request, res: Response) => {
    const {orderId} = req.params

    const order = await Order.findById(orderId).populate('ticket')
    if (!order){
        throw new NotFoundError()
    }

    if (order.userId !== req.user!.id){
        throw new NotAuthorizedError()
    }

    order.status = OrderStatus.CANCELLED
    await order.save()

    // Publish an event saying this order was cancelled

    await new OrderCancelledPublisher(natsWrapper.client).publish({
        id: order.id,
        version: order.version,
        ticket: {
            id: order.ticket.id,
            price: order.ticket.price
        }
    })

    res.send(order)
})

export {router as cancelOrderRouter}