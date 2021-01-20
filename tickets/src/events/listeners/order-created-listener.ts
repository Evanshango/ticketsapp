import {BaseListener, IOrderCreatedEvent, Subjects} from '@tixapp/common'
import {Message} from "node-nats-streaming";
import {QUEUE_GROUP_NAME} from "./queue-group-name";
import {Ticket} from "../../models/ticket";
import {TicketUpdatedPublisher} from "../publishers/ticket-updated-publisher";

export class OrderCreatedListener extends BaseListener<IOrderCreatedEvent> {
    readonly subject = Subjects.ORDER_CREATED
    queueGroupName = QUEUE_GROUP_NAME

    async onMessage(data: IOrderCreatedEvent["data"], msg: Message) {
        // Find the ticket that the order is reserving
        const ticket = await Ticket.findById(data.ticket.id)
        // If no ticket throw error (events might be out of order)
        if (!ticket) {
            throw new Error('Ticket not found')
        }
        // Mark the ticket as being reserved by setting the orderId property
        ticket.set({orderId: data.id})
        // Save the ticket
        await ticket.save()

        await new TicketUpdatedPublisher(this.client).publish({
            id: ticket.id,
            title: ticket.title,
            price: ticket.price,
            userId: ticket.userId,
            version: ticket.version,
            orderId: ticket.orderId
        })
        // Ack the message
        msg.ack()
    }
}