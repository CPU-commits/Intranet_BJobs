import { Module } from '@nestjs/common'
import { JobsService } from './service/jobs.service'

@Module({
    providers: [JobsService],
    exports: [JobsService],
})
export class JobsModule {}
