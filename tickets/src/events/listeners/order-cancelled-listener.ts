import {BaseListener, IOrderCancelledEvent, Subjects} from "@tixapp/common";
import {QUEUE_GROUP_NAME} from "./queue-group-name";
import {Message} from "node-nats-streaming";
import {Ticket} from "../../models/ticket";
import {TicketUpdatedPublisher} from "../publishers/ticket-updated-publisher";

export class OrderCancelledListener extends BaseListener<IOrderCancelledEvent>{
    readonly subject = Subjects.ORDER_CANCELLED
    queueGroupName = QUEUE_GROUP_NAME

    async onMessage(data: IOrderCancelledEvent["data"], msg: Message) {
        const ticket = await Ticket.findById(data.ticket.id)

        if (!ticket){
            throw new Error('Ticket not found')
        }

        ticket.set({orderId: undefined})
        await ticket.save()

        await new TicketUpdatedPublisher(this.client).publish({
            id: ticket.id,
            title: ticket.title,
            price: ticket.price,
            userId: ticket.userId,
            version: ticket.version,
        })

        msg.ack()
    }
}