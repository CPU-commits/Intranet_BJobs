import { Inject, Injectable } from '@nestjs/common'
import { ClientProxy } from '@nestjs/microservices'
import { Db } from 'mongodb'
import { JobsService } from 'src/modules/jobs/service/jobs.service'

@Injectable()
export class DatabaseService {
    jobs = {
        healthMongo: 'health mongo',
    }

    constructor(
        @Inject('MONGO') mongoClient: Db,
        @Inject('NATS_CLIENT') natsClient: ClientProxy,
        private readonly jobsService: JobsService,
    ) {
        this.jobsService.defineJob(this.jobs.healthMongo, async () => {
            const ping = (await mongoClient.command({
                ping: 1,
            })) as { ok: number }
            if (!ping.ok)
                natsClient.emit('mongo_health', {
                    health: false,
                })
        })
        this.runHealthMongo()
    }

    runHealthMongo() {
        this.jobsService.repeatEvery(this.jobs.healthMongo, '1 week')
    }
}
