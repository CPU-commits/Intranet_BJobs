import { Inject, Injectable } from '@nestjs/common'
import { ClientProxy } from '@nestjs/microservices'
import { InjectModel } from '@nestjs/mongoose'
import { ObjectId } from 'mongodb'
import { Model } from 'mongoose'
import { lastValueFrom } from 'rxjs'
import { User } from 'src/modules/database/entities/user.entity'
import { JobsService } from 'src/modules/jobs/service/jobs.service'
import { CourseLetter } from '../entities/course_letter.entity'
import { FileUploadClassroom } from '../entities/file_upload_classroom.entity'
import { FormAccess } from '../entities/form_access.entity'
import { ModuleClass } from '../entities/module.entity'
import { ModuleHistory } from '../entities/module_history.entity'
import { RepeatingStudent } from '../entities/repeating_student.entity'
import { Semester } from '../entities/semester.entity'
import { Student } from '../entities/student.entity'
import { Types } from 'mongoose'
import { KeyValue } from 'src/modules/database/entities/key_value.entity'
import { CloseDateKey, CloseDateSemester } from '../models/close_date'
import * as moment from 'moment'
import { CurrentSemesterStatusKey } from '../models/semester_status.model'
import { NextSectionStudent } from '../entities/next_section_student'
import { NotifyGlobal } from 'src/models/notify.model'

@Injectable()
export class ClassroomService {
    private readonly jobs = {
        closeForm: 'close form',
        closeSemester: 'close semester',
        updateCourse: 'update course',
    }

    constructor(
        private readonly jobService: JobsService,
        @InjectModel(CourseLetter.name)
        private readonly courseLetterModel: Model<CourseLetter>,
        @InjectModel(FileUploadClassroom.name)
        private readonly fUCModel: Model<FileUploadClassroom>,
        @InjectModel(FormAccess.name)
        private readonly formAccessModel: Model<FormAccess>,
        @InjectModel(ModuleClass.name)
        private readonly moduleClassModel: Model<ModuleClass>,
        @InjectModel(ModuleHistory.name)
        private readonly moduleHistoryModel: Model<ModuleHistory>,
        @InjectModel(Semester.name)
        private readonly semesterModel: Model<Semester>,
        @InjectModel(Student.name)
        private readonly studentModel: Model<Student>,
        @InjectModel(RepeatingStudent.name)
        private readonly repeatingStudentModel: Model<RepeatingStudent>,
        @InjectModel(KeyValue.name)
        private readonly keyValueModel: Model<KeyValue>,
        @InjectModel(User.name) private readonly userModel: Model<User>,
        @InjectModel(NextSectionStudent.name)
        private readonly nextSectionStudentModel: Model<NextSectionStudent>,
        @Inject('NATS_CLIENT') private readonly natsClient: ClientProxy,
    ) {
        // Close form
        this.jobService.defineJob(this.jobs.closeForm, async (job, done) => {
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
            done()
        })
        // Update course student
        this.jobService.defineJob(this.jobs.updateCourse, async (job, done) => {
            const { student, course } = job.attrs.data
            await this.studentModel
                .findOneAndUpdate(
                    {
                        user: student,
                    },
                    { $set: { course } },
                    { new: true },
                )
                .exec()
            done()
        })
        // Close semester
        this.jobService.defineJob(this.jobs.closeSemester, async (_, done) => {
            // Finish all grades
            const grades: { success: boolean } = await lastValueFrom(
                this.natsClient.send('close_grades_semester', ''),
            )
            if (grades?.success) {
                // Get all modules of valid semester
                const modules = await this.moduleClassModel
                    .find(
                        {
                            status: false,
                        },
                        { _id: 1 },
                    )
                    .exec()
                const date = new Date()
                // Get valid semester
                const semester = (await lastValueFrom(
                    this.natsClient.send('get_valid_semester', ''),
                )) as { _id: string; semester: number }
                // Format models
                const modulesHistory = await Promise.all(
                    modules.map(async (_module) => {
                        const students: Array<{
                            _id: string
                            user: {
                                _id: string
                            }
                        }> = await lastValueFrom(
                            this.natsClient.send(
                                'get_students_from_module',
                                _module._id.toString(),
                            ),
                        )
                        return {
                            students: students.map((student) => {
                                return new ObjectId(student.user._id)
                            }),
                            module: _module._id,
                            semester: new ObjectId(semester._id),
                            date,
                        }
                    }),
                )
                // Update course of students
                let studentsNewSections: Array<{
                    user: Types.ObjectId
                    course: string
                }> = []
                if (semester.semester === 2) {
                    const students = await this.studentModel
                        .find({ status: 1 })
                        .exec()
                    const sections = await this.courseLetterModel.find().exec()
                    const studentsRepeat = await this.repeatingStudentModel
                        .findOne({ semester: new ObjectId(semester._id) })
                        .exec()
                    // Filter students
                    const studentsWithSections = students.filter((student) => {
                        if (
                            !studentsRepeat.students.some(
                                (s) => s.toString() === student.user,
                            )
                        )
                            return student
                    })
                    studentsNewSections = await Promise.all(
                        studentsWithSections.map(async (student) => {
                            const sectionIndex = sections.findIndex(
                                (s) =>
                                    student.course.toString() ===
                                    s._id.toString(),
                            )

                            let nextSection: string
                            if (
                                sections[sectionIndex].is_next_section_variable
                            ) {
                                const nextSectionStudent =
                                    await this.nextSectionStudentModel
                                        .findOne({
                                            student: new ObjectId(student.user),
                                        })
                                        .exec()
                                nextSection =
                                    nextSectionStudent.section.toString()
                            } else {
                                nextSection =
                                    sections[
                                        sectionIndex
                                    ]?.next_section?.toString()
                            }
                            return {
                                user: student.user,
                                course: nextSection,
                            }
                        }),
                    )
                    // Register jobs and get students finished all courses
                    const updateStatusToFinish = []
                    studentsNewSections.forEach((student) => {
                        if (!student?.course)
                            updateStatusToFinish.push(
                                new ObjectId(student.user),
                            )
                    })
                    if (updateStatusToFinish.length > 0) {
                        await this.userModel
                            .updateMany(
                                {
                                    _id: {
                                        $in: updateStatusToFinish,
                                    },
                                },
                                {
                                    status: 2,
                                },
                                { new: true },
                            )
                            .exec()
                    }
                }
                // Delete next section students
                await this.nextSectionStudentModel.deleteMany().exec()
                // Insert
                await this.moduleHistoryModel.insertMany(modulesHistory)
                studentsNewSections.forEach((student) => {
                    if (student?.course)
                        this.jobService.now(this.jobs.updateCourse, {
                            student: student.user,
                            course: student.course,
                        })
                })
                await this.moduleClassModel
                    .updateMany(
                        {
                            status: false,
                        },
                        { $set: { status: true } },
                        { new: true },
                    )
                    .exec()
                await this.keyValueModel
                    .findOneAndUpdate(
                        {
                            key: CurrentSemesterStatusKey,
                        },
                        {
                            $set: {
                                value: 'working',
                            },
                        },
                        {
                            new: true,
                        },
                    )
                    .exec()
                await this.semesterModel
                    .findByIdAndUpdate(
                        semester._id,
                        {
                            $set: {
                                status: 0,
                            },
                        },
                        { new: true },
                    )
                    .exec()
                done()
            }
            // Notify
            this.natsClient.emit('notify/global', {
                Title: 'Ha finalizado exitosamente el semestre',
                Link: '/inicio',
                Type: 'global',
            } as NotifyGlobal)
        })
    }

    closeForm(when: Date, work: string, student: string) {
        this.jobService.scheduleJob(when, this.jobs.closeForm, {
            work,
            student,
        })
    }

    async closeSemester() {
        const closeDateSemester = (await this.keyValueModel
            .findOne({
                key: CloseDateKey,
            })
            .exec()) as CloseDateSemester
        const closeDate = moment().add(3, 'days').toDate()
        if (!closeDateSemester) {
            const newCloseDate = new this.keyValueModel({
                key: CloseDateKey,
                value: closeDate,
            })
            await newCloseDate.save()
        } else {
            await this.keyValueModel
                .findOneAndUpdate(
                    {
                        key: CloseDateKey,
                    },
                    {
                        $set: {
                            value: closeDate,
                        },
                    },
                    {
                        new: true,
                    },
                )
                .exec()
        }
        this.jobService.scheduleJob(closeDate, this.jobs.closeSemester)
        // this.jobService.now(this.jobs.closeSemester)
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

    interruptFinishSemester() {
        this.jobService.cancel({
            name: this.jobs.closeSemester,
        })
    }
}
