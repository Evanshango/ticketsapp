import request from "supertest";
import {app} from "../../app";
import mongoose from "mongoose";
import {Order} from "../../models/order";
import {Ticket} from "../../models/ticket";
import {OrderStatus} from "@tixapp/common";
import {natsWrapper} from "../../nats-wrapper";

it('returns an error if the ticket does not exist', async () => {
    const id = new mongoose.Types.ObjectId()

    await request(app).post('/api/orders').set('Cookie', global.signin()).send({
        ticketId: id
    }).expect(404)
});

it('returns an error if the ticket is already reserved', async () => {
    const ticket = Ticket.build({
        title: 'concert',
        price: 19,
        id: mongoose.Types.ObjectId().toHexString()
    })
    await ticket.save()

    const order = Order.build({
        ticket,
        userId: 'some_random_id',
        status: OrderStatus.CREATED,
        expiresAt: new Date()
    })
    await order.save()

    await request(app).post('/api/orders').set('Cookie', global.signin()).send({
        ticketId: ticket.id
    }).expect(400)

});

it('reserves a ticket', async () => {
    const ticket = Ticket.build({
        title: 'concert',
        price: 19,
        id: mongoose.Types.ObjectId().toHexString()
    })
    await ticket.save()

    await request(app).post('/api/orders').set('Cookie', global.signin()).send({
        ticketId: ticket.id
    }).expect(201)
});

it('emits an order created event', async () => {
    const ticket = Ticket.build({
        title: 'concert',
        price: 19,
        id: mongoose.Types.ObjectId().toHexString()
    })
    await ticket.save()

    await request(app).post('/api/orders').set('Cookie', global.signin()).send({
        ticketId: ticket.id
    }).expect(201)

    expect(natsWrapper.client.publish).toHaveBeenCalled()
})