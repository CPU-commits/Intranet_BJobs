import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { ObjectId } from 'mongodb'
import { Model } from 'mongoose'
import { JobsService } from 'src/modules/jobs/service/jobs.service'
import { CourseLetter } from '../entities/course_letter.entity'
import { FileUploadClassroom } from '../entities/file_upload_classroom.entity'
import { FormAccess } from '../entities/form_access.entity'
import { Work } from '../entities/work.entity'

@Injectable()
export class ClassroomService {
    private readonly jobs = {
        closeForm: 'close form',
    }

    constructor(
        private readonly jobService: JobsService,
        @InjectModel(Work.name) private readonly workModel: Model<Work>,
        @InjectModel(CourseLetter.name)
        private readonly courseLetterModel: Model<CourseLetter>,
        @InjectModel(FileUploadClassroom.name)
        private readonly fUCModel: Model<FileUploadClassroom>,
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

    async isUsedCourseLetterByIdFile(idFile: string) {
        const course = await this.courseLetterModel
            .findOne(
                {
                    file: idFile,
                },
                { _id: 1 },
            )
            .exec()
        return course != null
    }

    async isUsedFUCByIdFile(idFile: string) {
        const fUC = await this.fUCModel
            .findOne(
                {
                    files_uploaded: {
                        $in: [new ObjectId(idFile)],
                    },
                },
                { _id: 1 },
            )
            .exec()
        return fUC != null
    }
}
