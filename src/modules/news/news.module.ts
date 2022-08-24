import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'
import { News, NewsSchema } from './entities/news.entity'
import { NewsService } from './service/news.service'

@Module({
    imports: [
        MongooseModule.forFeature([
            {
                name: News.name,
                schema: NewsSchema,
            },
        ]),
    ],
    providers: [NewsService],
    exports: [NewsService],
})
export class NewsModule {}
