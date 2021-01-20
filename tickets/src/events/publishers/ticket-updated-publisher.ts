import {BasePublisher, ITicketUpdatedEvent, Subjects} from '@tixapp/common'

export class TicketUpdatedPublisher extends BasePublisher<ITicketUpdatedEvent>{
    readonly subject = Subjects.TICKET_UPDATED
}