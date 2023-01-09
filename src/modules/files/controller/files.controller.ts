import { Controller, UseInterceptors } from '@nestjs/common'
import { EventPattern, Payload } from '@nestjs/microservices'
import { LoggerInterceptor } from 'src/logger.interceptor'
import { FilesService } from '../service/files.service'

@UseInterceptors(LoggerInterceptor)
@Controller('files')
export class FilesController {
    constructor(private readonly filesService: FilesService) {}

    // Array of _id Mongodb Files
    @EventPattern('delete_files')
    deleteFiles(@Payload() files: Array<string>) {
        if (files?.length > 0) this.filesService.deleteFiles(files)
    }
}
