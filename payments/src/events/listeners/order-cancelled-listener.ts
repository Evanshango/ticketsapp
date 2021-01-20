import {BaseListener, IOrderCancelledEvent, OrderStatus, Subjects} from "@tixapp/common";
import {QUEUE_GROUP_NAME} from "./queue-group-name";
import {Message} from "node-nats-streaming";
import {Order} from "../../models/order";

export class OrderCancelledListener extends BaseListener<IOrderCancelledEvent>{
    readonly subject = Subjects.ORDER_CANCELLED
    queueGroupName = QUEUE_GROUP_NAME

    async onMessage(data: IOrderCancelledEvent["data"], msg: Message) {
        const order = await Order.findOne({
            _id: data.id,
            version: data.version - 1
        })

        if (!order){
            throw new Error('Order not found')
        }

        order.set({status: OrderStatus.CANCELLED})
        await order.save()

        msg.ack()

    }
}