
const Orders = ({orders}) => {
    return (
        <div>
            Your Orders
            <table className="table">
                <thead>
                <tr>
                    <th>Title</th>
                    <th>Status</th>
                </tr>
                </thead>
                <tbody>
                {orders.map(order => (
                    <tr key={order.id}>
                        <td>{order.ticket.title}</td>
                        <td style={{color: order.status !== 'COMPLETE' ? 'red' : 'green', fontWeight: 'bold'}}>
                            {order.status}
                        </td>
                    </tr>
                ))}
                </tbody>
            </table>
        </div>
    )
}

Orders.getInitialProps = async (context, client) => {
    const {data} = await client.get('/api/orders')
    return {orders: data}
}

export default Orders