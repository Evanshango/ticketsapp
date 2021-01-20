import mongoose from "mongoose";
import {OrderStatus} from "@tixapp/common";
import {updateIfCurrentPlugin} from "mongoose-update-if-current";

interface IOrderAttrs {
    id: string
    version: number
    userId: string
    price: number
    status: OrderStatus
}

interface IOrderDoc extends mongoose.Document {
    version: number
    userId: string
    price: number
    status: OrderStatus
}

interface IOrderModel extends mongoose.Model<IOrderDoc> {
    build(attrs: IOrderAttrs): IOrderDoc
}

const orderSchema = new mongoose.Schema({
    userId: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    status: {
        type: String,
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

orderSchema.set('versionKey', 'version')
orderSchema.plugin(updateIfCurrentPlugin)

orderSchema.statics.build = (attrs: IOrderAttrs) => (new Order({
    _id: attrs.id,
    version: attrs.version,
    price: attrs.price,
    userId: attrs.userId,
    status: attrs.status
}))

const Order = mongoose.model<IOrderDoc, IOrderModel>('Order', orderSchema)

export {Order}