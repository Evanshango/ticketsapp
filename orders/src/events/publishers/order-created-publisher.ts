import {BasePublisher, IOrderCreatedEvent, Subjects} from "@tixapp/common";

export class OrderCreatedPublisher extends BasePublisher<IOrderCreatedEvent>{
    readonly subject = Subjects.ORDER_CREATED
}