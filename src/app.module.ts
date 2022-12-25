import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import * as Joi from 'joi'
import config from './config'
import { DatabaseModule } from './database/database.module'
import { JobsModule } from './modules/jobs/jobs.module'
import { ClassroomModule } from './modules/classroom/classroom.module'
import { FilesModule } from './modules/files/files.module'
import { AwsModule } from './modules/aws/aws.module'
import { LibraryModule } from './modules/library/library.module'
import { NewsModule } from './modules/news/news.module'
import { DatabaseModuleHealth } from './modules/database/database.module'
import { NotificationsModule } from './modules/notifications/notifications.module'
import { VotingModule } from './modules/voting/voting.module'
import { MainController } from './main/main.controller'

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
                HOSTNAME: Joi.string().required(),
            }),
        }),
        DatabaseModule,
        JobsModule,
        ClassroomModule,
        FilesModule,
        AwsModule,
        LibraryModule,
        NewsModule,
        DatabaseModuleHealth,
        NotificationsModule,
        VotingModule,
    ],
    controllers: [MainController],
})
export class AppModule {}
