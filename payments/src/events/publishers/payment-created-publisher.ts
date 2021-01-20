import {BasePublisher, IPaymentCreatedEvent, Subjects} from "@tixapp/common";

export class PaymentCreatedPublisher extends BasePublisher<IPaymentCreatedEvent>{
    readonly subject = Subjects.PAYMENT_CREATED

}