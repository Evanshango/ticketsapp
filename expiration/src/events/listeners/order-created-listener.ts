import {BaseListener, IOrderCreatedEvent, Subjects} from "@tixapp/common";
import {Message} from "node-nats-streaming";
import {QUEUE_GROUP_NAME} from "./queue-group-name";
import {expirationQueue} from "../../queues/expiration-queue";

export class OrderCreatedListener extends BaseListener<IOrderCreatedEvent> {
    readonly subject = Subjects.ORDER_CREATED
    queueGroupName = QUEUE_GROUP_NAME

    async onMessage(data: IOrderCreatedEvent["data"], msg: Message) {
        const delay = new Date(data.expiresAt).getTime() - new Date().getTime()
        console.log('Waiting this many milliseconds to process job', delay)
        await expirationQueue.add({
            orderId: data.id
        }, {
            delay
        })

        msg.ack()
    }
}