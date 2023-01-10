import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { ObjectId } from 'mongodb'
import { Model } from 'mongoose'
import { AwsService } from 'src/modules/aws/service/aws.service'
import { ClassroomService } from 'src/modules/classroom/service/classroom.service'
import { JobsService } from 'src/modules/jobs/service/jobs.service'
import { LibraryService } from 'src/modules/library/service/library.service'
import { NewsService } from 'src/modules/news/service/news.service'
import { File } from '../entities/file.entity'
import { FileJob } from '../models/file_job.model'

@Injectable()
export class FilesService {
    private readonly jobs = {
        deleteFiles: 'delete files',
        deleteUnaccessFiles: 'delete unaccess files',
    }
    private readonly prefixFiles = {
        users: 'user_files',
        authors: 'authors',
        books: 'books',
        editorials: 'editorials',
        courseletters: 'sections',
        news: 'news',
        file_uploaded_classroom: 'classroom',
    }

    constructor(
        @InjectModel(File.name) private readonly filesModel: Model<File>,
        private readonly jobsService: JobsService,
        private readonly awsService: AwsService,
        private readonly libraryService: LibraryService,
        private readonly classroomService: ClassroomService,
        private readonly newsService: NewsService,
    ) {
        // Delete files
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
        // Delete files without access
        this.jobsService.defineJob(this.jobs.deleteUnaccessFiles, async () => {
            let flag = true
            let nextToken: string
            while (flag) {
                const objects = await this.awsService.listObjects(nextToken)
                if (objects.Contents)
                    await Promise.all(
                        objects.Contents.map(async (content) => {
                            const file = await this.getFileByKey(content.Key)
                            if (!file || (file && !file.status)) {
                                this.awsService.deleteFileAWS(content.Key)
                            } else if (
                                file &&
                                !file.key.includes(this.prefixFiles.users)
                            ) {
                                // See if file is used
                                const isUsed = await this.fileIsUsed(
                                    file._id.toString(),
                                    content.Key,
                                )
                                if (!isUsed)
                                    this.awsService.deleteFileAWS(content.Key)
                            }
                        }),
                    )
                if (!objects.NextContinuationToken) flag = false
                nextToken = objects.NextContinuationToken
            }
        })
        this.deleteUnaccessFiles()
    }

    private async getFileByKey(key: string) {
        return await this.filesModel
            .findOne({
                key,
            })
            .exec()
    }

    private async fileIsUsed(idFile: string, key: string): Promise<boolean> {
        if (key.includes(this.prefixFiles.authors)) {
            // Authors
            return await this.libraryService.isUsedAuthorByImageId(idFile)
        } else if (key.includes(this.prefixFiles.books)) {
            // Books
            return await this.libraryService.isUsedBookByFilesId(idFile)
        } else if (key.includes(this.prefixFiles.editorials)) {
            // Editorials
            return await this.libraryService.isUsedEditorialByImageId(idFile)
        } else if (key.includes(this.prefixFiles.courseletters)) {
            // Course letters
            return await this.classroomService.isUsedCourseLetterByIdFile(
                idFile,
            )
        } else if (key.includes(this.prefixFiles.file_uploaded_classroom)) {
            // Files uploaded classroom
            return await this.classroomService.isUsedFUCByIdFile(idFile)
        } else if (key.includes(this.prefixFiles.news)) {
            // News
            return await this.newsService.isUsedNewsByIdImg(idFile)
        }
        return true
    }

    private deleteUnaccessFiles() {
        this.jobsService.repeatEvery(this.jobs.deleteUnaccessFiles, 'one week')
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
