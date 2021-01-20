import {BaseListener, IExpirationCompleteEvent, OrderStatus, Subjects} from "@tixapp/common";
import {Message} from "node-nats-streaming";
import {QUEUE_GROUP_NAME} from "./queue-group-name";
import {Order} from "../../models/order";
import {OrderCancelledPublisher} from "../publishers/order-cancelled-publisher";

export class ExpirationCompleteListener extends BaseListener<IExpirationCompleteEvent>{
    readonly subject = Subjects.EXPIRATION_COMPLETE
    queueGroupName = QUEUE_GROUP_NAME

    async onMessage(data: IExpirationCompleteEvent["data"], msg: Message) {
        const order = await Order.findById(data.orderId).populate('ticket')

        if (!order){
            throw new Error('Order not found')
        }

        if (order.status === OrderStatus.COMPLETE){
            return msg.ack()
        }

        order.set({status: OrderStatus.CANCELLED})
        await order.save()

        await new OrderCancelledPublisher(this.client).publish({
            id: order.id,
            version: order.version,
            ticket: {
                id: order.ticket.id,
                price: order.ticket.price
            }
        })

        msg.ack()
    }
}