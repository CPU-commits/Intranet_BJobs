import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { ObjectId } from 'mongodb'
import { Model } from 'mongoose'
import { News } from '../entities/news.entity'

@Injectable()
export class NewsService {
    constructor(
        @InjectModel(News.name) private readonly newsModel: Model<News>,
    ) {}

    async isUsedNewsByIdImg(idImage: string) {
        const news = await this.newsModel
            .findOne(
                {
                    img: new ObjectId(idImage),
                },
                { _id: 1 },
            )
            .exec()
        return news != null
    }
}
