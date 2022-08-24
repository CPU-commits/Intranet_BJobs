import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'
import { JobsModule } from '../jobs/jobs.module'
import { Author, AuthorSchema } from './entities/author.entity'
import { Book, BookSchema } from './entities/book.entity'
import { Editorial, EditorialSchema } from './entities/editorial.entity'
import { RankBook, RankBookSchema } from './entities/rank_book.entity'
import { LibraryService } from './service/library.service'

@Module({
    imports: [
        MongooseModule.forFeature([
            {
                name: Book.name,
                schema: BookSchema,
            },
            {
                name: RankBook.name,
                schema: RankBookSchema,
            },
            {
                name: Author.name,
                schema: AuthorSchema,
            },
            {
                name: Editorial.name,
                schema: EditorialSchema,
            },
        ]),
        JobsModule,
    ],
    providers: [LibraryService],
    exports: [LibraryService],
})
export class LibraryModule {}
