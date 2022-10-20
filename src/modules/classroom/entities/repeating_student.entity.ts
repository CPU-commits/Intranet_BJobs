import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { Types } from 'mongoose'
import { Student } from './student.entity'
import { Semester } from './semester.entity'

@Schema()
export class RepeatingStudent {
    @Prop({ required: true, type: Types.ObjectId, ref: Semester.name })
    semester: Types.ObjectId | Semester

    @Prop({
        required: true,
        type: [{ type: Types.ObjectId, ref: Student.name }],
    })
    students: Types.Array<Types.ObjectId> | Student[]

    @Prop({ required: true })
    date: Date
}

export const RepeatingStudentSchema =
    SchemaFactory.createForClass(RepeatingStudent)
