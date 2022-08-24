import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { Types } from 'mongoose'

@Schema({ versionKey: false, collection: 'news' })
export class News {
    @Prop({ required: true, type: Types.ObjectId })
    author_id: Types.ObjectId

    @Prop({ required: true, maxlength: 100 })
    title: string

    @Prop({ required: true, maxlength: 500 })
    headline: string

    @Prop({ required: true })
    body: string

    @Prop({ required: true, type: Types.ObjectId })
    img: Types.ObjectId

    @Prop({ required: true })
    url: string

    @Prop({ required: true, enum: ['student', 'global'] })
    type: string

    @Prop({ required: true })
    upload_date: Date

    @Prop({ required: true })
    update_date: Date

    @Prop({ required: true })
    status: boolean
}

export const NewsSchema = SchemaFactory.createForClass(News)
