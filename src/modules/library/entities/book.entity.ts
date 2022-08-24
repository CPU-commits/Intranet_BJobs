import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { Types } from 'mongoose'

@Schema()
export class Book {
    @Prop({ required: true, maxlength: 150 })
    name: string

    @Prop({ required: true, unique: true })
    slug: string

    @Prop({ required: true, maxlength: 500 })
    synopsis: string

    @Prop({ required: true, type: [{ type: Types.ObjectId }] })
    tags: Types.Array<Types.ObjectId>

    @Prop({ required: true, type: Types.ObjectId })
    author: Types.ObjectId

    @Prop()
    ranking: number

    @Prop({ type: Types.ObjectId, ref: 'File', required: true })
    image: Types.ObjectId

    @Prop({ required: true, type: Types.ObjectId, ref: 'File' })
    book: Types.ObjectId

    @Prop({ required: true, type: Types.ObjectId })
    editorial: Types.ObjectId

    @Prop({ required: true })
    date_upload: Date

    @Prop({ required: true })
    date_update: Date
}

export const BookSchema = SchemaFactory.createForClass(Book)
