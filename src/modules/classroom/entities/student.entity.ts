import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { Types } from 'mongoose'

@Schema()
export class Student {
    @Prop({ required: true, type: Types.ObjectId })
    user: Types.ObjectId

    @Prop({ type: Types.ObjectId })
    course: Types.ObjectId

    @Prop({ required: true })
    registration_number: string
}

export const StudentSchema = SchemaFactory.createForClass(Student)
