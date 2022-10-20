import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { Types } from 'mongoose'

@Schema({ collection: 'next_section_students' })
export class NextSectionStudent {
    @Prop({ type: Types.ObjectId })
    section: Types.ObjectId

    @Prop({ type: Types.ObjectId })
    student: Types.ObjectId
}

export const NextSectionStudentSchema =
    SchemaFactory.createForClass(NextSectionStudent)
