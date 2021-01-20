import {Message} from "node-nats-streaming";
import {Ticket} from "../../models/ticket";
import {BaseListener, ITicketCreatedEvent, Subjects} from "@tixapp/common";
import {QUEUE_GROUP_NAME} from "./queue-group-name";

export class TicketCreatedListener extends BaseListener<ITicketCreatedEvent>{
    readonly subject = Subjects.TICKET_CREATED
    queueGroupName = QUEUE_GROUP_NAME

    async onMessage(data: ITicketCreatedEvent["data"], msg: Message) {
        const {id, title, price} = data

        const ticket = Ticket.build({
            id, title, price
        })
        await ticket.save()

        msg.ack()
    }
}