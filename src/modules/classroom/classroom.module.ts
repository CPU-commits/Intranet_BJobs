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
        ]),
    ],
    providers: [ClassroomService],
    controllers: [ClassroomController],
    exports: [ClassroomService],
})
export class ClassroomModule {}
