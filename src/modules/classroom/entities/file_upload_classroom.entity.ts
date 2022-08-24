import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { Types } from 'mongoose'

export type EvaluateFile = {
    _id: Types.ObjectId
    points: number
    pattern: Types.ObjectId
}

@Schema({ versionKey: false, collection: 'file_uploaded_classroom' })
export class FileUploadClassroom {
    @Prop({ required: true, type: Types.ObjectId })
    work: Types.ObjectId

    @Prop({ required: true, type: Types.ObjectId })
    student: Types.ObjectId

    @Prop({ required: true, type: [Types.ObjectId] })
    files_uploaded: Types.Array<Types.ObjectId>

    @Prop({ required: true })
    date: Date

    @Prop({
        type: [
            {
                _id: { type: Types.ObjectId, required: true },
                points: { type: Number, required: true },
                pattern: { type: Types.ObjectId, required: true },
            },
        ],
    })
    evaluate: EvaluateFile[]
}

export const FileUploadClassroomSchema =
    SchemaFactory.createForClass(FileUploadClassroom)
