import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import * as Joi from 'joi'
import config from './config'
import { DatabaseModule } from './database/database.module'
import { JobsModule } from './modules/jobs/jobs.module'
import { ClassroomModule } from './modules/classroom/classroom.module'

@Module({
    imports: [
        ConfigModule.forRoot({
            envFilePath: '.env',
            load: [config],
            isGlobal: true,
            validationSchema: Joi.object({
                MONGO_DB: Joi.string().required(),
                MONGO_HOST: Joi.string().required(),
                MONGO_ROOT_USERNAME: Joi.string().required(),
                MONGO_ROOT_PASSWORD: Joi.string().required(),
                MONGO_PORT: Joi.number().required(),
                MONGO_CONNECTION: Joi.string().required(),
                NATS_HOST: Joi.string().required(),
            }),
        }),
        DatabaseModule,
        JobsModule,
        ClassroomModule,
    ],
})
export class AppModule {}
