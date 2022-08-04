import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { ObjectId } from 'mongodb'
import { Model } from 'mongoose'
import { AwsService } from 'src/modules/aws/service/aws.service'
import { JobsService } from 'src/modules/jobs/service/jobs.service'
import { File } from '../entities/file.entity'
import { FileJob } from '../models/file_job.model'

@Injectable()
export class FilesService {
    private readonly jobs = {
        deleteFiles: 'delete files',
    }

    constructor(
        @InjectModel(File.name) private readonly filesModel: Model<File>,
        private readonly jobsService: JobsService,
        private readonly awsService: AwsService,
    ) {
        this.jobsService.defineJob(this.jobs.deleteFiles, async (job: any) => {
            const { files } = job.attrs.data
            const fileType = files as Array<FileJob>
            await Promise.all(
                fileType.map(async (file) => {
                    this.awsService.deleteFileAWS(file.key)
                }),
            )
            await this.filesModel.updateMany(
                {
                    $or: fileType.map((file) => {
                        return { _id: new ObjectId(file._id) }
                    }),
                },
                { $set: { status: false } },
                { new: true },
            )
        })
    }

    private async getFiles(files: Array<string>) {
        return await this.filesModel
            .find(
                {
                    $or: files.map((file) => {
                        return { _id: new ObjectId(file) }
                    }),
                },
                { key: 1 },
            )
            .exec()
    }

    async deleteFiles(files: Array<string>) {
        const filesDb = await this.getFiles(files)
        this.jobsService.now(this.jobs.deleteFiles, {
            files: filesDb.map((file) => {
                return {
                    _id: file._id.toString(),
                    key: file.key,
                }
            }) as Array<FileJob>,
        })
    }
}
