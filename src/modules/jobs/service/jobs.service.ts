import { Inject, Injectable } from '@nestjs/common'
import { Db } from 'mongodb'
import { Agenda, Processor } from 'agenda'
import config from 'src/config'
import { ConfigType } from '@nestjs/config'

@Injectable()
export class JobsService {
    private readonly collection = 'jobs'
    private cron: Agenda

    constructor(
        @Inject('MONGO') mongoClient: Db,
        @Inject(config.KEY) configService: ConfigType<typeof config>,
    ) {
        const { connection, user, password, host, port } = configService.mongo
        this.cron = new Agenda({
            db: {
                collection: this.collection,
                address: `${connection}://${user}:${password}@${host}:${port}`,
            },
            mongo: mongoClient,
        })
        this.cron.start()
    }

    defineJob(name: string, toDo: Processor) {
        this.cron.define(name, toDo)
    }

    async scheduleJob(when: string, name: string, data?: any) {
        await this.cron.schedule(when, name, data)
    }

    async repeatEvery(name: string, repeatEvery: string, data?: any) {
        const repeatJob = this.cron.create(name, data)
        await repeatJob.repeatEvery(repeatEvery).save()
    }

    async now(name: string, data?: any) {
        await this.cron.now(name, data)
    }
}
