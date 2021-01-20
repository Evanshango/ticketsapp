import request from "supertest";
import {app} from "../../app";
import mongoose from "mongoose";
import {natsWrapper} from "../../nats-wrapper";
import {Ticket} from "../../models/ticket";

it('returns a 404 if the provided id does not exist ', async () => {
    const id = new mongoose.Types.ObjectId().toHexString()
    await request(app).patch(`/api/tickets${id}`).set('Cookie', global.signin()).send({
        title: 'sample title',
        price: 20
    }).expect(404)
});

it('returns a 401 if the user is not authenticated ', async () => {
    const id = new mongoose.Types.ObjectId().toHexString()
    await request(app).patch(`/api/tickets/${id}`).send({
        title: 'sample title update',
        price: 20
    }).expect(401)
});

it('returns a 401 if the user does not own the ticket ', async () => {
    const newTicket = await request(app).post('/api/tickets').set('Cookie', global.signin()).send({
        title: 'sample title',
        price: 20
    }).expect(201)
    await request(app).patch(`/api/tickets/${newTicket.body.id}`).set('Cookie', global.signin()).send({
        title: 'sample title update',
        price: 18
    }).expect(401)
});

it('returns a 400 if the user provides an invalid title or price ', async () => {
    const cookie = global.signin()
    const response = await request(app).post('/api/tickets').set('Cookie', cookie).send({
        title: 'sample title',
        price: 18
    }).expect(201)
    await request(app).patch(`/api/tickets/${response.body.id}`).set('Cookie', cookie).send({
        title: 'sa'
    }).expect(400)
    await request(app).patch(`/api/tickets/${response.body.id}`).set('Cookie', cookie).send({
        price: -10
    }).expect(400)
});

it('updates a ticket if the user provides valid inputs', async () => {
    const cookie = global.signin()
    const response = await request(app).post('/api/tickets').set('Cookie', cookie).send({
        title: 'sample title',
        price: 18
    }).expect(201)

    const update1 = await request(app).patch(`/api/tickets/${response.body.id}`).set('Cookie', cookie).send({
        title: 'sample title update'
    }).expect(200)
    expect(update1.body.title).toEqual('sample title update')

    const update2 = await request(app).patch(`/api/tickets/${response.body.id}`).set('Cookie', cookie).send({
        price: 25
    }).expect(200)
    expect(update2.body.price).toEqual(25)
});

it('publishes an event on successful update', async () => {
    const cookie = global.signin()
    const response = await request(app).post('/api/tickets').set('Cookie', cookie).send({
        title: 'sample title',
        price: 18
    }).expect(201)
    const update1 = await request(app).patch(`/api/tickets/${response.body.id}`).set('Cookie', cookie).send({
        title: 'sample title update'
    }).expect(200)
    expect(update1.body.title).toEqual('sample title update')
    expect(natsWrapper.client.publish).toHaveBeenCalled()
});

it('rejects updates if the ticket is reserved', async () => {
    const cookie = global.signin()
    const response = await request(app).post('/api/tickets').set('Cookie', cookie).send({
        title: 'sample title',
        price: 18
    }).expect(201)

    const ticket = await Ticket.findById(response.body.id)
    ticket.set({orderId: mongoose.Types.ObjectId().toHexString()})
    await ticket.save()

    await request(app).patch(`/api/tickets/${response.body.id}`).set('Cookie', cookie).send({
        title: 'sample title update'
    }).expect(400)
});