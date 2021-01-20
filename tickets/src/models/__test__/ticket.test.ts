import {Ticket} from "../ticket";

it('implements optimistic concurrency control', async (done) => {
    // Create an instance of a ticket
    const ticket = Ticket.build({
        title: 'concert',
        price: 5,
        userId: '12345678910'
    })

    // Save the ticket to the database
    await ticket.save()

    // Fetch the ticket twice
    const instance1 = await Ticket.findById(ticket.id)
    const instance2 = await Ticket.findById(ticket.id)

    // Make 2 separate changes to the ticket
    instance1.set({price: 10})
    instance2.set({price: 15})
    // Save the first fetched ticket and expect it to go through
    await instance1.save()
    // save the second fetched ticket (expect it to fail)
    try {
        await instance2.save()
    } catch (err) {
        return done()
    }
    throw new Error('Should not reach this point')
});

it('increments the version number on multiple saves', async () => {
    const ticket = Ticket.build({
        title: 'concert',
        price: 20,
        userId: '1234'
    })
    await ticket.save()
    expect(ticket.version).toEqual(0)

    await ticket.save()
    expect(ticket.version).toEqual(1)
    await ticket.save()
    expect(ticket.version).toEqual(2)
});