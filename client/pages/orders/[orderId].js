import {useEffect, useState} from 'react'
import StripeCheckout from 'react-stripe-checkout'
import useRequest from "../../hooks/useRequest";
import Router from "next/router";

const ShowOrder = ({order, user}) => {
    const [timeLeft, setTimeLeft] = useState(0)
    const {doRequest, errors} = useRequest({
        url: '/api/payments',
        method: 'post',
        body: {
            orderId: order.id
        },
        onSuccess: () => {
            (() => Router.push('/orders'))()
        }
    })

    useEffect(() => {
        const findTimeLeft = () => {
            const msLeft = new Date(order.expiresAt) - new Date()
            setTimeLeft(Math.round(msLeft / 1000))
        }
        findTimeLeft()
        const timerId = setInterval(findTimeLeft, 1000)
        return () => {
            clearInterval(timerId)
        }
    }, [order])

    if (timeLeft < 0) {
        return (
            <div>
                <h6 style={{color: 'red'}}>Order Expired</h6>
            </div>
        )
    }

    return (
        <div>
            Time left to pay {timeLeft} seconds
            <StripeCheckout token={({id}) => doRequest({token: id})} amount={order.ticket.price * 100}
                            email={user.email} stripeKey='pk_test_cWTE4dbbGuSZEZHg2gDv0uRP00U3TvfUU0'/>
            {errors}
        </div>
    )
}

ShowOrder.getInitialProps = async (context, client) => {
    const {orderId} = context.query
    const {data} = await client.get(`/api/orders/${orderId}`)
    return {order: data}
}

export default ShowOrder