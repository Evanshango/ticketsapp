import {ExpirationCompleteListener} from "../expiration-complete-listener";
import {natsWrapper} from "../../../nats-wrapper";
import {Order} from "../../../models/order";
import {Ticket} from "../../../models/ticket";
import mongoose from "mongoose";
import {IExpirationCompleteEvent, OrderStatus} from "@tixapp/common";
import {Message} from "node-nats-streaming";

const setup = async () => {
    const listener = new ExpirationCompleteListener(natsWrapper.client)

    const ticket = Ticket.build({
        id: mongoose.Types.ObjectId().toHexString(),
        title: 'concert',
        price: 20
    })
    await ticket.save()

    const order = Order.build({
        status: OrderStatus.CANCELLED,
        userId: 'some_random_id',
        expiresAt: new Date(),
        ticket
    })

    await order.save()

    const data: IExpirationCompleteEvent['data'] = {
        orderId: order.id
    }

    // @ts-ignore
    const msg: Message = {
        ack: jest.fn()
    }

    return {listener, data, msg, order, ticket}
}

it('updates the order status to CANCELLED', async () => {
    const {listener, data, msg, order} = await setup()

    await listener.onMessage(data, msg)

    const updatedOrder = await Order.findById(order.id)

    expect(updatedOrder.status).toEqual(OrderStatus.CANCELLED)
});

it('emit an order CANCELLED event', async () => {
    const {listener, data, msg, order} = await setup()

    await listener.onMessage(data, msg)
    expect(natsWrapper.client.publish).toHaveBeenCalled()

    const eventData = JSON.parse((natsWrapper.client.publish as jest.Mock).mock.calls[0][1])

    expect(eventData.id).toEqual(order.id)
});

it('ack the message', async () => {
    const {listener, data, msg} = await setup()

    await listener.onMessage(data, msg)

    expect(msg.ack).toHaveBeenCalled()
});