import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { Types } from 'mongoose'

@Schema()
export class Vote {
    @Prop({ required: true, type: Types.ObjectId })
    user: Types.ObjectId

    @Prop({ required: true, type: Types.ObjectId })
    list: Types.ObjectId

    @Prop({ required: true })
    date: Date
}

export const VoteSchema = SchemaFactory.createForClass(Vote)
