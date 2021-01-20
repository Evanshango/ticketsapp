import express, {Request, Response} from 'express'
import {
    BadRequestError, NotAuthorizedError, NotFoundError, OrderStatus, requireAuth, validateRequest
} from "@tixapp/common";
import {body} from "express-validator";
import {Order} from "../models/order";
import {stripe} from "../stripe";
import {Payment} from "../models/payment";
import {PaymentCreatedPublisher} from "../events/publishers/payment-created-publisher";
import {natsWrapper} from "../nats-wrapper";

const router = express.Router()

router.post('/payments', requireAuth, [
    body('token').not().isEmpty(),
    body('orderId').not().isEmpty()
], validateRequest, async (req: Request, res: Response) => {
    const {token, orderId} = req.body

    const order = await Order.findById(orderId)
    if (!order) throw new NotFoundError()

    if (order.userId !== req.user!.id) throw new NotAuthorizedError()

    if (order.status === OrderStatus.CANCELLED) throw new BadRequestError('Cannot pay for a cancelled order')

    const charge = await stripe.charges.create({
        currency: 'usd',
        amount: order.price * 100,
        source: token
    })

    const payment = Payment.build({
        orderId,
        stripeId: charge.id,
        amount: charge.amount
    })
    await payment.save()

    await new PaymentCreatedPublisher(natsWrapper.client).publish({
        id: payment.id,
        orderId: payment.orderId,
        stripeId: payment.stripeId,
        amount: payment.amount
    })

    res.status(201).send({
        success: true,
        payment
    })
})

export {router as createChargeRouter}