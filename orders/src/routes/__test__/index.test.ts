import request from "supertest";
import {app} from "../../app";
import {Ticket} from "../../models/ticket";
import mongoose from "mongoose";

const buildTicket = async () => {
    const ticket = Ticket.build({
        title: 'concert',
        price: 20,
        id: mongoose.Types.ObjectId().toHexString()
    })
    await ticket.save()
    return ticket
}

it('fetches orders for a particular user ', async () => {
    // Create three tickets
    const ticket1 = await buildTicket()
    const ticket2 = await buildTicket()
    const ticket3 = await buildTicket()
    // Create an order as userOne
    const userOne = global.signin()
    const userTwo = global.signin()
    await request(app).post('/api/orders').set('Cookie', userOne).send({
        ticketId: ticket1.id
    }).expect(201)
    //Create two orders as useTwo
    const {body: orderOne} = await request(app).post('/api/orders').set('Cookie', userTwo).send({
        ticketId: ticket2.id
    }).expect(201)
    const {body: orderTwo} = await request(app).post('/api/orders').set('Cookie', userTwo).send({
        ticketId: ticket3.id
    }).expect(201)
    //Make request to get orders for userTwo
    const response = await request(app).get('/api/orders').set('Cookie', userTwo).expect(200)

    expect(response.body.length).toEqual(2)
    expect(response.body[0].id).toEqual(orderOne.id)
    expect(response.body[1].status).toEqual(orderTwo.status)
});