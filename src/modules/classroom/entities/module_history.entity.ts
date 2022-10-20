import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { Types } from 'mongoose'
import { ModuleClass } from './module.entity'

@Schema()
export class ModuleHistory {
    @Prop({ required: true, type: [Types.ObjectId] })
    students: Types.Array<Types.ObjectId>

    @Prop({ required: true, type: Types.ObjectId, ref: ModuleClass.name })
    module: Types.ObjectId | ModuleClass

    @Prop({ required: true, type: Types.ObjectId })
    semester: Types.ObjectId

    @Prop({ required: true })
    date: Date
}

export const ModuleHistorySchema = SchemaFactory.createForClass(ModuleHistory)
