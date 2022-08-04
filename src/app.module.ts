import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import * as Joi from 'joi'
import config from './config'
import { DatabaseModule } from './database/database.module'
import { JobsModule } from './modules/jobs/jobs.module'
import { ClassroomModule } from './modules/classroom/classroom.module'
import { FilesModule } from './modules/files/files.module'
import { AwsModule } from './modules/aws/aws.module'

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
                AWS_BUCKET: Joi.string().required(),
                AWS_ACCESS_KEY_ID: Joi.string().required(),
                AWS_SECRET_ACCESS_KEY: Joi.string().required(),
            }),
        }),
        DatabaseModule,
        JobsModule,
        ClassroomModule,
        FilesModule,
        AwsModule,
    ],
})
export class AppModule {}
