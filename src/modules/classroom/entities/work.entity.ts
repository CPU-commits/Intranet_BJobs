import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { Types } from 'mongoose'

export enum WorkType {
    'files',
    'form',
}

export enum FormAccess {
    'default',
    'wtime',
}

export class Pattern {
    title: string
    description: string
    points: number
}

@Schema({ versionKey: false, collection: 'works' })
export class Work {
    @Prop({ required: true, type: Types.ObjectId })
    author: Types.ObjectId

    @Prop({ required: true, type: Types.ObjectId })
    module: Types.ObjectId

    @Prop({ required: true, maxlength: 100 })
    title: string

    @Prop({ required: true })
    is_qualified: boolean

    @Prop({
        required: true,
        enum: [WorkType.files, WorkType.form],
        type: String,
    })
    type: keyof typeof WorkType

    @Prop({ required: true })
    date_limit: Date

    @Prop({ required: true })
    date_start: Date

    @Prop({ required: true })
    date_upload: Date

    @Prop({ required: true })
    date_update: Date

    @Prop({ type: Types.ObjectId })
    form?: Types.ObjectId

    @Prop({ enum: [FormAccess.default, FormAccess.wtime], type: String })
    form_access: keyof typeof FormAccess

    @Prop({ min: 1 })
    time_access: number

    @Prop({
        type: [
            {
                title: { maxlength: 100, type: String },
                description: { maxlength: 100, type: String },
                points: { type: Number, min: 1 },
            },
        ],
    })
    pattern: Pattern
}

export const SchemaWork = SchemaFactory.createForClass(Work)
