import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'
import { JobsModule } from '../jobs/jobs.module'
import {
    Notification,
    NotificationSchema,
} from './entities/notification.entity'
import {
    NotificationsUser,
    NotificationsUserSchema,
} from './entities/notifications_user.entity'
import { NotificationsService } from './service/notifications.service'

@Module({
    imports: [
        JobsModule,
        MongooseModule.forFeature([
            {
                name: Notification.name,
                schema: NotificationSchema,
            },
            {
                name: NotificationsUser.name,
                schema: NotificationsUserSchema,
            },
        ]),
    ],
    providers: [NotificationsService],
})
export class NotificationsModule {}
