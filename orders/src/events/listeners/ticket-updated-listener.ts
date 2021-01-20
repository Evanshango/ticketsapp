import {BaseListener, ITicketUpdatedEvent, Subjects} from "@tixapp/common";
import {QUEUE_GROUP_NAME} from "./queue-group-name";
import {Message} from "node-nats-streaming";
import {Ticket} from "../../models/ticket";

export class TicketUpdatedListener extends BaseListener<ITicketUpdatedEvent> {
    readonly subject = Subjects.TICKET_UPDATED
    queueGroupName = QUEUE_GROUP_NAME

    async onMessage(data: ITicketUpdatedEvent["data"], msg: Message) {
        const {price, title} = data

        const ticket = await Ticket.findByEvent(data)

        if (!ticket) {
            throw new Error('Ticket not found')
        }

        ticket.set({title, price})
        await ticket.save()

        msg.ack()
    }
}