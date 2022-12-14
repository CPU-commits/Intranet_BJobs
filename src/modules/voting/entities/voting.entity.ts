import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { Types } from 'mongoose'
import { User } from 'src/modules/database/entities/user.entity'

export class List {
    _id: Types.ObjectId
    list_name: string
    students: Array<{
        _id: User & { _id: Types.ObjectId }
        rol: string
    }>
}

@Schema()
export class Voting {
    @Prop({ required: true })
    start_date: Date

    @Prop({ required: true })
    finish_date: Date

    @Prop({ required: true })
    period: number

    @Prop({
        required: true,
        type: [
            {
                _id: { type: Types.ObjectId, required: true },
                list_name: { type: String, maxlength: 100, required: true },
                students: {
                    type: [
                        {
                            _id: {
                                type: Types.ObjectId,
                                required: true,
                                ref: 'User',
                            },
                            rol: {
                                type: String,
                                required: true,
                                maxlength: 50,
                            },
                        },
                    ],
                    required: true,
                },
            },
        ],
    })
    lists: Array<List>

    @Prop({ required: true, type: Types.ObjectId })
    semester: Types.ObjectId
}

export const VotingSchema = SchemaFactory.createForClass(Voting)
