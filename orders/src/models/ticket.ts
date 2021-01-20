import mongoose from 'mongoose';
import {Order, OrderStatus} from './order';
import {updateIfCurrentPlugin} from "mongoose-update-if-current";

interface ITicketAttrs {
    id: string
    title: string
    price: number
}

export interface ITicketDoc extends mongoose.Document {
    title: string
    price: number
    version: number

    isReserved(): Promise<boolean>
}

interface ITicketModel extends mongoose.Model<ITicketDoc> {
    build(attrs: ITicketAttrs): ITicketDoc;

    findByEvent(event: { id: string, version: number }): Promise<ITicketDoc | null>
}

const ticketSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
    },
    price: {
        type: Number,
        required: true,
        min: 0,
    },
}, {
    toJSON: {
        transform(doc, ret) {
            ret.id = ret._id;
            delete ret._id;
        },
    },
});

ticketSchema.set('versionKey', 'version')
ticketSchema.plugin(updateIfCurrentPlugin)

ticketSchema.statics.build = (attrs: ITicketAttrs) => {
    return new Ticket({
        _id: attrs.id,
        title: attrs.title,
        price: attrs.price
    });
};

ticketSchema.statics.findByEvent = (event: { id: string, version: number }) => {
    return Ticket.findOne({
        _id: event.id,
        version: event.version - 1
    })
}

ticketSchema.methods.isReserved = async function () {
    const existingOrder = await Order.findOne({
        // @ts-ignore
        ticket: this,
        status: {
            $in: [OrderStatus.CREATED, OrderStatus.AWAITING_PAYMENT, OrderStatus.COMPLETE],
        }
    });

    return !!existingOrder;
};

const Ticket = mongoose.model<ITicketDoc, ITicketModel>('Ticket', ticketSchema);

export {Ticket};
