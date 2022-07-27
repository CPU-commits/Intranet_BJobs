import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { ObjectId } from 'mongodb'
import { Model } from 'mongoose'
import { JobsService } from 'src/modules/jobs/service/jobs.service'
import { FormAccess } from '../entities/form_access.entity'
import { Work } from '../entities/work.entity'

@Injectable()
export class ClassroomService {
    private readonly jobs = {
        closeForm: 'close form',
        reviseForm: 'revise form',
    }

    constructor(
        private readonly jobService: JobsService,
        @InjectModel(Work.name) private readonly workModel: Model<Work>,
        @InjectModel(FormAccess.name)
        private readonly formAccessModel: Model<FormAccess>,
    ) {
        this.jobService.defineJob(this.jobs.closeForm, async (job: any) => {
            const { work, student } = job.attrs.data
            await this.formAccessModel
                .findOneAndUpdate(
                    {
                        work: new ObjectId(work),
                        student: new ObjectId(student),
                    },
                    {
                        $set: {
                            status: 'finished',
                        },
                    },
                    { new: true },
                )
                .exec()
        })
    }

    closeForm(when: string, work: string, student: string) {
        this.jobService.scheduleJob(when, this.jobs.closeForm, {
            work,
            student,
        })
    }
}
