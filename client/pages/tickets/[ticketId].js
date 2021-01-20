import useRequest from "../../hooks/useRequest";
import Router from "next/router";

const ShowTicket = ({ticket}) => {

    const {doRequest, errors} = useRequest({
        url: '/api/orders',
        method: 'post',
        body: {
            ticketId: ticket.id
        },
        onSuccess: (order) => {
            (() => Router.push('/orders/[orderId]', `/orders/${order.id}`))()
        }
    })

    return (
        <div className='p-4'>
            <h5>{ticket.title}</h5>
            <h5>Price: {(ticket.price).toFixed(2)}</h5>
            {errors}
            <button className="btn btn-sm btn-success w-25 mr-3" onClick={() => doRequest()}>Purchase</button>
        </div>
    )
}

ShowTicket.getInitialProps = async (context, client) => {
    const {ticketId} = context.query
    const {data} = await client.get(`/api/tickets/${ticketId}`)
    return {ticket: data}
}

export default ShowTicket