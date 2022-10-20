import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { Types } from 'mongoose'

@Schema()
export class CourseLetter {
    @Prop({ required: true })
    section: string

    @Prop({ required: true, type: Types.ObjectId })
    file: Types.ObjectId

    @Prop({ type: Types.ObjectId, ref: 'Teacher' })
    header_teacher: Types.ObjectId

    @Prop({ required: true, type: Types.ObjectId })
    course: Types.ObjectId

    @Prop({ required: true })
    next_section: string

    @Prop({ default: false })
    is_next_section_variable: boolean

    @Prop({ default: true })
    status: boolean
}

export const CourseLetterSchema = SchemaFactory.createForClass(CourseLetter)
CourseLetterSchema.index(
    { header_teacher: 1 },
    {
        unique: true,
        partialFilterExpression: { header_teacher: { $type: 'string' } },
    },
)
