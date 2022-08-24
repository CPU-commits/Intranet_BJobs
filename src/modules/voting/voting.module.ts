import { Module } from '@nestjs/common'
import { VotingService } from './service/voting.service'
import { VotingController } from './controller/voting.controller'
import { MongooseModule } from '@nestjs/mongoose'
import { KeyValue, KeyValueSchema } from '../database/entities/key_value.entity'
import { JobsModule } from '../jobs/jobs.module'
import { ClientsModule, Transport } from '@nestjs/microservices'
import config from 'src/config'
import { ConfigType } from '@nestjs/config'
import { Vote, VoteSchema } from './entities/vote.entity'
import { Voting, VotingSchema } from './entities/voting.entity'
import { AwsModule } from '../aws/aws.module'
import { User, UserSchema } from '../database/entities/user.entity'

@Module({
    imports: [
        MongooseModule.forFeature([
            {
                name: KeyValue.name,
                schema: KeyValueSchema,
            },
            {
                name: Vote.name,
                schema: VoteSchema,
            },
            {
                name: Voting.name,
                schema: VotingSchema,
            },
            {
                name: User.name,
                schema: UserSchema,
            },
        ]),
        JobsModule,
        ClientsModule.registerAsync([
            {
                name: 'NATS_CLIENT',
                inject: [config.KEY],
                useFactory: (configService: ConfigType<typeof config>) => {
                    return {
                        transport: Transport.NATS,
                        options: {
                            servers: [`nats://${configService.nats}:4222`],
                        },
                    }
                },
            },
        ]),
        AwsModule,
    ],
    providers: [VotingService],
    controllers: [VotingController],
})
export class VotingModule {}
