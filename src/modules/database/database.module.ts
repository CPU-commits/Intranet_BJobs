import { Module } from '@nestjs/common'
import { DatabaseController } from './controller/database.controller'
import { JobsModule } from '../jobs/jobs.module'
import { ClientsModule, Transport } from '@nestjs/microservices'
import config from 'src/config'
import { MongooseModule } from '@nestjs/mongoose'
import { KeyValue, KeyValueSchema } from './entities/key_value.entity'
import { User, UserSchema } from './entities/user.entity'
import { getNatsServers } from 'src/utils/get_nats_servers'

@Module({
    imports: [
        JobsModule,
        ClientsModule.registerAsync([
            {
                name: 'NATS_CLIENT',
                inject: [config.KEY],
                useFactory: () => {
                    return {
                        transport: Transport.NATS,
                        options: {
                            servers: getNatsServers(),
                        },
                    }
                },
            },
        ]),
        MongooseModule.forFeature([
            {
                name: KeyValue.name,
                schema: KeyValueSchema,
            },
            {
                name: User.name,
                schema: UserSchema,
            },
        ]),
    ],
    controllers: [DatabaseController],
})
export class DatabaseModuleHealth {}
