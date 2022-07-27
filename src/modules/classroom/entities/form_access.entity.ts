import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { Types } from 'mongoose'

export enum StatusFormAccess {
    'opened',
    'finished',
    'revised',
}

@Schema({ versionKey: false, collection: 'students_access_form' })
export class FormAccess {
    @Prop({ required: true, type: Types.ObjectId })
    student: Types.ObjectId

    @Prop({ required: true, type: Types.ObjectId })
    work: Types.ObjectId

    @Prop({ required: true, type: Date })
    date: Date

    @Prop({
        required: true,
        enum: [
            StatusFormAccess.revised,
            StatusFormAccess.opened,
            StatusFormAccess.finished,
        ],
        type: String,
    })
    status: keyof typeof StatusFormAccess
}

export const SchemaFormAccess = SchemaFactory.createForClass(FormAccess)
