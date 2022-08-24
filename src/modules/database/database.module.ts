import { Module } from '@nestjs/common'
import { DatabaseService } from './service/database.service'
import { DatabaseController } from './controller/database.controller'
import { JobsModule } from '../jobs/jobs.module'
import { ClientsModule, Transport } from '@nestjs/microservices'
import config from 'src/config'
import { ConfigType } from '@nestjs/config'
import { MongooseModule } from '@nestjs/mongoose'
import { KeyValue, KeyValueSchema } from './entities/key_value.entity'
import { User, UserSchema } from './entities/user.entity'

@Module({
    imports: [
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
    providers: [DatabaseService],
    controllers: [DatabaseController],
})
export class DatabaseModuleHealth {}
