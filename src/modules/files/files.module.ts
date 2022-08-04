import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'
import { AwsModule } from '../aws/aws.module'
import { JobsModule } from '../jobs/jobs.module'
import { FilesController } from './controller/files.controller'
import { File, SchemaFile } from './entities/file.entity'
import { FilesService } from './service/files.service'

@Module({
    imports: [
        MongooseModule.forFeature([
            {
                name: File.name,
                schema: SchemaFile,
            },
        ]),
        JobsModule,
        AwsModule,
    ],
    controllers: [FilesController],
    providers: [FilesService],
})
export class FilesModule {}
