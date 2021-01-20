import express, {Request, Response} from "express";
import mongoose from "mongoose";
import {body} from "express-validator";
import {BadRequestError, NotFoundError, OrderStatus, requireAuth, validateRequest} from '@tixapp/common'
import {Ticket} from "../models/ticket";
import {Order} from '../models/order'
import {natsWrapper} from "../nats-wrapper";
import {OrderCreatedPublisher} from "../events/publishers/order-created-publisher";

const router = express.Router()

const EXP_WINDOW_SECONDS = 60 * 2

router.post('/orders', requireAuth, [
    body('ticketId').not().isEmpty()
        .custom((input: string) => mongoose.Types.ObjectId.isValid(input)) //optional
        .withMessage('Ticket Id must be provided')
], validateRequest, async (req: Request, res: Response) => {
    const {ticketId} = req.body

    // Find the ticket the user is trying to order in the DB
    const ticket = await Ticket.findById(ticketId)
    if (!ticket) {
        throw new NotFoundError()
    }
    /*
    Make sure that this ticket is not already reserved
    Run query to find an order where ticket is the ticket just found and order status is *not* cancelled
     */
    const isReserved = await ticket.isReserved()
    if (isReserved) {
        throw new BadRequestError('Ticket is already reserved')
    }

    // Calculate an expiration date for this order
    const expiration = new Date()
    expiration.setSeconds(expiration.getSeconds() + EXP_WINDOW_SECONDS)

    // Build the order and save it to the database
    const order = Order.build({
        userId: req.user!.id,
        expiresAt: expiration,
        status: OrderStatus.CREATED,
        ticket
    })
    await order.save()
    // Publish an event to notify order creation
    await new OrderCreatedPublisher(natsWrapper.client).publish({
        id: order.id,
        version: order.version,
        status: order.status,
        userId: order.userId,
        expiresAt: order.expiresAt.toISOString(),
        ticket: {
            id: order.ticket.id,
            price: order.ticket.price
        }
    })

    res.status(201).send(order)
})

export {router as createOrderRouter}