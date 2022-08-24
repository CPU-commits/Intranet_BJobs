import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { Types } from 'mongoose'
import { Notification } from './notification.entity'

@Schema()
export class NotificationsUser {
    @Prop({ required: true, type: Types.ObjectId })
    user: Types.ObjectId

    @Prop({ required: true, type: Types.ObjectId, ref: Notification.name })
    notification: Types.ObjectId | Notification

    @Prop({ required: true, default: false })
    readed: boolean

    @Prop({ required: true })
    date: Date
}

export const NotificationsUserSchema =
    SchemaFactory.createForClass(NotificationsUser)
