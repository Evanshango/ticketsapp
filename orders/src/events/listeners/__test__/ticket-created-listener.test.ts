import {TicketCreatedListener} from "../ticket-created-listener";
import {ITicketCreatedEvent} from "@tixapp/common";
import {natsWrapper} from "../../../nats-wrapper";
import mongoose from "mongoose";
import {Message} from "node-nats-streaming";
import {Ticket} from "../../../models/ticket";

const setup = async () => {
    // Create an instance of the listener
    const listener = new TicketCreatedListener(natsWrapper.client)
    // Create a fake data object
    const data: ITicketCreatedEvent['data'] = {
        id: new mongoose.Types.ObjectId().toHexString(),
        version: 0,
        title: 'concert',
        price: 450,
        userId: new mongoose.Types.ObjectId().toHexString()
    }
    // Create a fake message object
    // @ts-ignore
    const msg: Message = {
        ack: jest.fn()
    }

    return {listener, data, msg}
}

it('creates and saves a ticket', async () => {
    const {listener, data, msg} = await setup()
    // Call the onMessage() function with the data object + the message
    await listener.onMessage(data, msg)
    // Write assertion to make sure a ticket was created
    const ticket = await Ticket.findById(data.id)

    expect(ticket).toBeDefined()
    expect(ticket.title).toEqual(data.title)
    expect(ticket.price).toEqual(data.price)
});

it("acks the message", async () => {
    const {listener, data, msg} = await setup()
    // Call the onMessage() function with the data object + the message
    await listener.onMessage(data, msg)
    // Write assertion to make sure ack function is called
    expect(msg.ack).toHaveBeenCalled()
});