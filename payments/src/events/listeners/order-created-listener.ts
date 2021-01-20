import {BaseListener, IOrderCreatedEvent, Subjects} from "@tixapp/common";
import {QUEUE_GROUP_NAME} from "./queue-group-name";
import {Message} from "node-nats-streaming";
import {Order} from "../../models/order";

export class OrderCreatedListener extends BaseListener<IOrderCreatedEvent>{
    readonly subject = Subjects.ORDER_CREATED
    queueGroupName = QUEUE_GROUP_NAME

    async onMessage(data: IOrderCreatedEvent["data"], msg: Message) {
        const order = Order.build({
            id: data.id,
            price: data.ticket.price,
            status: data.status,
            userId: data.userId,
            version: data.version
        })
        await order.save()

        msg.ack()
    }
}