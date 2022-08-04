import { Controller } from '@nestjs/common'
import { EventPattern, Payload } from '@nestjs/microservices'
import { FilesService } from '../service/files.service'

@Controller('files')
export class FilesController {
    constructor(private readonly filesService: FilesService) {}

    @EventPattern('delete_files')
    deleteFiles(@Payload() files: Array<string>) {
        if (files?.length > 0) this.filesService.deleteFiles(files)
    }
}
