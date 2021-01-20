import {BasePublisher, IOrderCancelledEvent, Subjects} from "@tixapp/common";

export class OrderCancelledPublisher extends BasePublisher<IOrderCancelledEvent> {
    readonly subject = Subjects.ORDER_CANCELLED
}