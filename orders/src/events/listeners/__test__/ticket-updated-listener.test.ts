import {TicketUpdatedListener} from "../ticket-updated-listener";
import {natsWrapper} from "../../../nats-wrapper";
import {Ticket} from "../../../models/ticket";
import mongoose from "mongoose";
import {ITicketUpdatedEvent} from "@tixapp/common";
import {Message} from "node-nats-streaming";

const setup = async () => {
    // Create a listener
    const listener = new TicketUpdatedListener(natsWrapper.client)
    // Create and save a ticket
    const ticket = Ticket.build({
        id: new mongoose.Types.ObjectId().toHexString(),
        title: 'concert',
        price: 300
    })
    await ticket.save()
    // Create a fake data object
    const data: ITicketUpdatedEvent['data'] = {
        id: ticket.id,
        version: ticket.version + 1,
        title: 'concert updated',
        price: 320,
        userId: new mongoose.Types.ObjectId().toHexString()
    }
    // Create a fake message object
    // @ts-ignore
    const msg: Message = {
        ack: jest.fn()
    }
    // Return all of these stuff
    return {listener, data, ticket, msg}
}

it('finds, updates and saves a ticket', async () => {
    const {listener, data, ticket, msg} = await setup()

    await listener.onMessage(data, msg)

    const updatedTicket = await Ticket.findById(ticket.id)

    expect(updatedTicket.title).toEqual(data.title)
    expect(updatedTicket.price).toEqual(data.price)
    expect(updatedTicket.version).toEqual(data.version)
});

it('acks the message', async () =>  {
    const {listener, data, msg} = await setup()

    await listener.onMessage(data, msg)

    expect(msg.ack).toHaveBeenCalled()
});

it('does not call ack if the event has a skipped version', async () => {
    const {listener, data, msg} = await setup()

    data.version = 10

    try {
        await listener.onMessage(data, msg)
    } catch (e){}

    expect(msg.ack).not.toHaveBeenCalled()
});