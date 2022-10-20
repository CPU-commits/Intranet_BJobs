import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'
import { JobsModule } from '../jobs/jobs.module'
import { FormAccess, SchemaFormAccess } from './entities/form_access.entity'
import { ClassroomService } from './service/classroom.service'
import { ClassroomController } from './controller/classroom.controller'
import { SchemaWork, Work } from './entities/work.entity'
import {
    CourseLetter,
    CourseLetterSchema,
} from './entities/course_letter.entity'
import {
    FileUploadClassroom,
    FileUploadClassroomSchema,
} from './entities/file_upload_classroom.entity'
import { ClientsModule, Transport } from '@nestjs/microservices'
import config from 'src/config'
import { ConfigType } from '@nestjs/config'
import { ModuleClass, ModuleClassSchema } from './entities/module.entity'
import {
    ModuleHistory,
    ModuleHistorySchema,
} from './entities/module_history.entity'
import { Semester, SemesterSchema } from './entities/semester.entity'
import { Student, StudentSchema } from './entities/student.entity'
import {
    RepeatingStudent,
    RepeatingStudentSchema,
} from './entities/repeating_student.entity'
import { User, UserSchema } from '../database/entities/user.entity'
import { KeyValue, KeyValueSchema } from '../database/entities/key_value.entity'
import {
    NextSectionStudent,
    NextSectionStudentSchema,
} from './entities/next_section_student'

@Module({
    imports: [
        JobsModule,
        MongooseModule.forFeature([
            {
                name: FormAccess.name,
                schema: SchemaFormAccess,
            },
            {
                name: Work.name,
                schema: SchemaWork,
            },
            {
                name: CourseLetter.name,
                schema: CourseLetterSchema,
            },
            {
                name: FileUploadClassroom.name,
                schema: FileUploadClassroomSchema,
            },
            {
                name: ModuleClass.name,
                schema: ModuleClassSchema,
            },
            {
                name: ModuleHistory.name,
                schema: ModuleHistorySchema,
            },
            {
                name: Semester.name,
                schema: SemesterSchema,
            },
            {
                name: Student.name,
                schema: StudentSchema,
            },
            {
                name: RepeatingStudent.name,
                schema: RepeatingStudentSchema,
            },
            {
                name: User.name,
                schema: UserSchema,
            },
            {
                name: KeyValue.name,
                schema: KeyValueSchema,
            },
            {
                name: NextSectionStudent.name,
                schema: NextSectionStudentSchema,
            },
        ]),
        ClientsModule.registerAsync([
            {
                name: 'NATS_CLIENT',
                inject: [config.KEY],
                useFactory: (configService: ConfigType<typeof config>) => {
                    return {
                        transport: Transport.NATS,
                        options: {
                            servers: [`nats://${configService.nats}:4222`],
                        },
                    }
                },
            },
        ]),
    ],
    providers: [ClassroomService],
    controllers: [ClassroomController],
    exports: [ClassroomService],
})
export class ClassroomModule {}
