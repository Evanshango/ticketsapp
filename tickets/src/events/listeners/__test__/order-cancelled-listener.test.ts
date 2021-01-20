import {natsWrapper} from "../../../nats-wrapper";
import {OrderCancelledListener} from "../order-cancelled-listener";
import {Ticket} from "../../../models/ticket";
import mongoose from "mongoose";
import {IOrderCancelledEvent} from "@tixapp/common";
import {Message} from "node-nats-streaming";

const setup = async () => {
    const listener = new OrderCancelledListener(natsWrapper.client)

    const orderId = mongoose.Types.ObjectId().toHexString()
    const ticket = Ticket.build({
        title: 'concert',
        price: 20,
        userId: 'some_random_key',
    })
    ticket.set({orderId})
    await ticket.save()

    const data: IOrderCancelledEvent['data'] = {
        id: orderId,
        version: 0,
        ticket: {
            id: ticket.id,
            price: ticket.price
        }
    }

    // @ts-ignore
    const msg: Message = {
        ack: jest.fn()
    }

    return {listener, ticket, data, msg, orderId}
}

it('updates the ticket, publishes an event and acks the message', async () => {
    const {listener, ticket, data, msg} = await setup()

    await listener.onMessage(data, msg)

    const updatedTicket = await Ticket.findById(ticket.id)
    expect(updatedTicket.orderId).not.toBeDefined()
    expect(msg.ack).toHaveBeenCalled()
    expect(natsWrapper.client.publish).toHaveBeenCalled()
});