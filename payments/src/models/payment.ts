import mongoose from "mongoose";

interface IPaymentAttrs {
    orderId: string
    stripeId: string
    amount: number
}

interface IPaymentDoc extends mongoose.Document {
    orderId: string
    stripeId: string
    amount: number
}

interface IPaymentModel extends mongoose.Model<IPaymentDoc> {
    build(attrs: IPaymentAttrs): IPaymentDoc
}

const paymentSchema = new mongoose.Schema({
    orderId: {
        type: String,
        required: true
    },
    stripeId: {
        type: String,
        required: true
    },
    amount: {
        type: Number,
        required: true
    }
}, {
    toJSON: {
        transform(doc, ret) {
            ret.id = ret._id
            delete ret._id
        }
    }
})

paymentSchema.statics.build = (attrs: IPaymentAttrs) => (new Payment(attrs))

const Payment = mongoose.model<IPaymentDoc, IPaymentModel>('Payment', paymentSchema)

export {Payment}