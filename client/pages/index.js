import Link from 'next/link'

const LandingPage = ({tickets}) => {

    const ticketList = tickets.map(ticket => (
        <tr key={ticket.id}>
            <td>{ticket.title}</td>
            <td>{(ticket.price).toFixed(2)}</td>
            <td>
                <Link href='/tickets/[ticketId]' as={`/tickets/${ticket.id}`}>
                    <button className="btn btn-sm btn-outline-primary w-25 mr-3">View</button>
                </Link>
                <button className="btn btn-sm btn-outline-success w-25">Update</button>
            </td>
        </tr>
    ))

    return (
        <div className='p-3'>
            {/*<p><b>Welcome</b>{user.email}</p>*/}
            <h4 className='p-3'>Available Tickets</h4>
            <table className="table">
                <thead>
                <tr>
                    <th>Title</th>
                    <th>Price</th>
                    <th>Actions</th>
                </tr>
                </thead>
                <tbody>
                {ticketList}
                </tbody>
            </table>
        </div>
    )
}

LandingPage.getInitialProps = async (context, client, user) => {
    const {data} = await client.get('/api/tickets')
    return {tickets: data.tickets, user}
}

export default LandingPage