import {BasePublisher, IExpirationCompleteEvent, Subjects} from "@tixapp/common";

export class ExpirationCompletePublisher extends BasePublisher<IExpirationCompleteEvent>{
    readonly subject = Subjects.EXPIRATION_COMPLETE
}