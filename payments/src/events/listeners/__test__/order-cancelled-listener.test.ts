import {natsWrapper} from "../../../nats-wrapper";
import {IOrderCancelledEvent, OrderStatus} from "@tixapp/common";
import mongoose from "mongoose";
import {Message} from "node-nats-streaming";
import {OrderCancelledListener} from "../order-cancelled-listener";
import {Order} from "../../../models/order";

const setup = async () => {
    const listener = new OrderCancelledListener(natsWrapper.client)

    const order = Order.build({
        id: mongoose.Types.ObjectId().toHexString(),
        version: 0,
        userId: 'some_random_id',
        price: 10,
        status: OrderStatus.CREATED
    })
    await order.save()

    const data: IOrderCancelledEvent['data'] = {
        id: order.id,
        version: 1,
        ticket: {
            id: 'some_random_id',
            price: 20
        }
    }

    // @ts-ignore
    const msg: Message = {
        ack: jest.fn()
    }

    return {listener, data, msg, order}
}

it('updates the status of the order ', async () => {
    const {listener, data, msg, order} = await setup()

    await listener.onMessage(data, msg)

    const updatedOrder = await Order.findById(order.id)

    expect(updatedOrder!.status).toEqual(OrderStatus.CANCELLED)
});

it('acks the message', async () => {
    const {listener, data, msg} = await setup()

    await listener.onMessage(data, msg)

    expect(msg.ack).toHaveBeenCalled()
});