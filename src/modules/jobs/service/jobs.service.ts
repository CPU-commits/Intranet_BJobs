import { Inject, Injectable, Logger } from '@nestjs/common'
import { Db, Document, Filter } from 'mongodb'
import { Agenda, Job, JobAttributesData, Processor } from 'agenda'
import config from 'src/config'
import { ConfigType } from '@nestjs/config'
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston'

@Injectable()
export class JobsService {
    private readonly collection = 'jobs'
    private cron: Agenda

    constructor(
        @Inject('MONGO') mongoClient: Db,
        @Inject(config.KEY) configService: ConfigType<typeof config>,
        @Inject(WINSTON_MODULE_NEST_PROVIDER) private readonly logger: Logger,
    ) {
        const { connection, user, password, host, port } = configService.mongo
        this.cron = new Agenda({
            db: {
                collection: this.collection,
                address: `${connection}://${user}:${password}@${host}:${port}`,
            },
            mongo: mongoClient,
            name: `${configService.host}-node`,
        })
        this.cron.start()
        this.logger.log(`Agenda cron start`, JobsService.name)
        // Events
        this.cron.on('start', (job: Job<JobAttributesData>) => {
            this.logger.log(
                `Job ${job.attrs.name} starting ${job.attrs?._id ?? 'null'}`,
            )
        })
        this.cron.on('complete', (job: Job<JobAttributesData>) => {
            this.logger.log(
                `Job ${job.attrs.name} finished ${job.attrs?._id ?? 'null'}`,
            )
        })
        this.cron.on('success', (job: Job<JobAttributesData>) => {
            this.logger.log(
                `Job ${job.attrs.name} success ${job.attrs?._id ?? 'null'}`,
            )
        })
        this.cron.on('fail', (job: Job<JobAttributesData>) => {
            this.logger.error(
                `Job ${job.attrs.name} failed ${job.attrs?._id ?? 'null'}`,
            )
        })
    }

    defineJob(name: string, toDo: Processor) {
        this.cron.define(name, toDo)
    }

    async scheduleJob(when: string, name: string, data?: any) {
        this.logger.log(
            `Schedule job with name ${name} - when: ${when}`,
            JobsService.name,
        )
        return await this.cron.schedule(when, name, data)
    }

    async repeatEvery(name: string, repeatEvery: string, data?: any) {
        this.logger.log(
            `Repeat job with name ${name} - every: ${repeatEvery}`,
            JobsService.name,
        )
        const repeatJob = this.cron.create(name, data)
        await repeatJob.repeatEvery(repeatEvery).save()
    }

    async now(name: string, data?: any) {
        this.logger.log(`Execute job now with name ${name}`, JobsService.name)
        await this.cron.now(name, data)
    }

    async cancel(query: Filter<Document>) {
        this.logger.log(
            `Canel job with query match ${query.$text}`,
            JobsService.name,
        )
        return await this.cron.cancel(query)
    }
}
