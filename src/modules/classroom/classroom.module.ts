import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'
import { JobsModule } from '../jobs/jobs.module'
import { FormAccess, SchemaFormAccess } from './entities/form_access.entity'
import { ClassroomService } from './service/classroom.service'
import { ClassroomController } from './controller/classroom.controller'
import { SchemaWork, Work } from './entities/work.entity'

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
        ]),
    ],
    providers: [ClassroomService],
    controllers: [ClassroomController],
})
export class ClassroomModule {}
