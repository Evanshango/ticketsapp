import {BaseListener, IPaymentCreatedEvent, OrderStatus, Subjects} from "@tixapp/common"
import {QUEUE_GROUP_NAME} from "./queue-group-name";
import {Message} from "node-nats-streaming";
import {Order} from "../../models/order";

export class PaymentCreatedListener extends BaseListener<IPaymentCreatedEvent>{
    readonly subject = Subjects.PAYMENT_CREATED
    queueGroupName = QUEUE_GROUP_NAME

    async onMessage(data: IPaymentCreatedEvent["data"], msg: Message) {
        const order = await Order.findById(data.orderId)

        if (!order) throw new Error('Order not found')

        order.set({status: OrderStatus.COMPLETE})
        await order.save()

        msg.ack()
    }
}