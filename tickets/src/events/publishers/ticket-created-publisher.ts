import {BasePublisher, ITicketCreatedEvent, Subjects} from "@tixapp/common";

export class TicketCreatedPublisher extends BasePublisher<ITicketCreatedEvent> {
    readonly subject = Subjects.TICKET_CREATED
}