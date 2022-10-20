import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { Types } from 'mongoose'

export class SubSection {
    _id: Types.ObjectId
    name: string
}

@Schema()
export class ModuleClass {
    @Prop({ required: true, type: Types.ObjectId })
    section: Types.ObjectId

    @Prop({ required: true, type: Types.ObjectId })
    subject: Types.ObjectId

    @Prop({ required: true, type: Types.ObjectId })
    semester: Types.ObjectId

    /*
        0 = Not finished
        1 = Finished
    */
    @Prop({ default: false, type: Boolean })
    status: boolean

    @Prop({
        type: [
            {
                _id: {
                    type: Types.ObjectId,
                },
                name: {
                    required: true,
                    type: String,
                    maxlength: 100,
                    minlength: 3,
                },
            },
        ],
    })
    sub_sections: Types.Array<SubSection>
}

export const ModuleClassSchema = SchemaFactory.createForClass(ModuleClass)
