import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import * as moment from 'moment'
import { Model } from 'mongoose'
import { JobsService } from 'src/modules/jobs/service/jobs.service'
import { Notification } from '../entities/notification.entity'
import { NotificationsUser } from '../entities/notifications_user.entity'

@Injectable()
export class NotificationsService {
    jobs = {
        deleteNotifications: 'deleteNotifications',
    }

    constructor(
        @InjectModel(Notification.name)
        private readonly notificationsModel: Model<Notification>,
        @InjectModel(NotificationsUser.name)
        private readonly notificationsUserModel: Model<NotificationsUser>,
        private readonly jobsService: JobsService,
    ) {
        jobsService.defineJob(this.jobs.deleteNotifications, async () => {
            const notifications = await this.notificationsModel
                .find(null, {
                    date: 1,
                })
                .exec()
            const now = moment(new Date())
            const deleteNotifications = await Promise.all(
                notifications
                    .filter(async (notification) => {
                        const diff = now.diff(
                            moment(notification.date),
                            'years',
                        )
                        if (diff >= 0.9) return notification
                        const notificationUser =
                            await this.notificationsUserModel
                                .findOne({
                                    notification: notification._id,
                                })
                                .exec()
                        if (!notificationUser) return notification
                    })
                    .map((notification) => {
                        return {
                            _id: notification._id,
                        }
                    }),
            )
            if (deleteNotifications.length > 0) {
                this.notificationsUserModel
                    .deleteMany({
                        $or: deleteNotifications.map((notification) => {
                            return {
                                notification: notification._id.toString(),
                            }
                        }),
                    })
                    .exec()
                this.notificationsModel
                    .deleteMany({
                        $or: deleteNotifications,
                    })
                    .exec()
            }
        })
        this.doJob()
    }

    doJob() {
        this.jobsService.repeatEvery(this.jobs.deleteNotifications, 'one week')
    }
}
