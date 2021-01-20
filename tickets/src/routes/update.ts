import express, {Request, Response} from "express";
import {body} from "express-validator";
import {BadRequestError, NotAuthorizedError, NotFoundError, requireAuth, validateRequest} from '@tixapp/common'
import {Ticket} from "../models/ticket";
import {TicketUpdatedPublisher} from "../events/publishers/ticket-updated-publisher";
import {natsWrapper} from "../nats-wrapper";

const router = express.Router()

router.patch('/tickets/:id', requireAuth, [
    body('title').optional().isLength({min: 4}).withMessage('Title should have a min of 4 characters'),
    body('price').optional().isFloat({gt: 0}).withMessage('Price must be greater than 0')
], validateRequest, async (req: Request, res: Response) => {
    const ticket = await Ticket.findById(req.params.id)
    if (!ticket) {
        throw new NotFoundError()
    }

    if (ticket.orderId) {
        throw new BadRequestError('Cannot edit a reserved ticket')
    }

    if (ticket.userId !== req.user!.id) {
        throw new NotAuthorizedError()
    }

    const {title, price} = req.body

    if (title !== undefined && price !== undefined) {
        ticket.set({
            title, price, userId: req.user!.id
        })
    } else if (title !== undefined && price === undefined) {
        ticket.set({
            title, price: ticket.price, userId: req.user!.id
        })
    } else if (price !== undefined && title === undefined) {
        ticket.set({
            title: ticket.title, price, userId: req.user!.id
        })
    }

    await ticket.save()

    await new TicketUpdatedPublisher(natsWrapper.client).publish({
        id: ticket.id, title: ticket.title, price: ticket.price, userId: ticket.userId, version: ticket.version
    })

    return res.send(ticket)
})

export {router as updateTicketRouter}