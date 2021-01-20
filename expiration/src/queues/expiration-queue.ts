import Queue from 'bull'
import {natsWrapper} from "../nats-wrapper";
import {ExpirationCompletePublisher} from "../events/publishers/expiration-complete-publisher";

interface IPayload {
    orderId: string
}

const expirationQueue = new Queue<IPayload>('ORDER_EXPIRATION', {
    redis: {
        host: process.env.REDIS_HOST
    }
})

expirationQueue.process(async (job) => {
    await new ExpirationCompletePublisher(natsWrapper.client).publish({
        orderId: job.data.orderId
    })
})

export {expirationQueue}

