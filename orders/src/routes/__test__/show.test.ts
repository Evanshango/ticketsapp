import request from "supertest";
import {app} from "../../app";
import {Ticket} from "../../models/ticket";
import mongoose from "mongoose";

it('fetches the order', async () => {
    // Create a ticket
   const ticket = Ticket.build({
       title: 'concert',
       price: 20,
       id: mongoose.Types.ObjectId().toHexString()
   })
    await ticket.save()

    const user = global.signin()
    // Make a request to build an order with this ticket
    const {body: order} = await request(app).post('/api/orders').set('Cookie', user).send({
        ticketId: ticket.id
    }).expect(201)
    // Make a request to fetch the order
    const {body: fetchedOrder} = await request(app).get(`/api/orders/${order.id}`).set('Cookie', user)
        .send().expect(200)

    expect(fetchedOrder.id).toEqual(order.id)
});

it("returns a 401 when a user tries to fetch someone else's orders", async () => {
    const ticket = Ticket.build({
        title: 'concert',
        price: 20,
        id: mongoose.Types.ObjectId().toHexString()
    })
    await ticket.save()

    const {body: order} = await request(app).post('/api/orders').set('Cookie', global.signin()).send({
        ticketId: ticket.id
    }).expect(201)
    await request(app).get(`/api/orders/${order.id}`).set('Cookie', global.signin()).send().expect(401)
});