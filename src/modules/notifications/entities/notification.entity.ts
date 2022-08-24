import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { Date, Types } from 'mongoose'

@Schema()
export class Notification {
    @Prop({ required: true })
    title: string

    @Prop({ required: true })
    url: string

    @Prop()
    img: string

    @Prop({ type: Types.ObjectId })
    subject: Types.ObjectId

    @Prop({ type: String, enum: ['grade', 'publication', 'work'] })
    type_classroom: string

    @Prop({ required: true, enum: ['global', 'classroom'] })
    type: string

    @Prop({ required: true, type: Date })
    date: string
}

export const NotificationSchema = SchemaFactory.createForClass(Notification)
