import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { Types } from 'mongoose'

@Schema()
export class Editorial {
    @Prop({ required: true, maxlength: 100 })
    editorial: string

    @Prop({ required: true, unique: true })
    slug: string

    @Prop({ required: true, type: Types.ObjectId })
    image: Types.ObjectId

    @Prop({ default: true })
    status: boolean

    @Prop({ required: true })
    date: Date
}

export const EditorialSchema = SchemaFactory.createForClass(Editorial)
