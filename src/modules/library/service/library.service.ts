import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'
import { JobsService } from 'src/modules/jobs/service/jobs.service'
import { Author } from '../entities/author.entity'
import { Book } from '../entities/book.entity'
import { Editorial } from '../entities/editorial.entity'
import { RankBook } from '../entities/rank_book.entity'

@Injectable()
export class LibraryService {
    private readonly jobs = {
        rankBooks: 'rank books',
    }

    constructor(
        @InjectModel(Book.name) private readonly bookModel: Model<Book>,
        @InjectModel(RankBook.name)
        private readonly rankBookModel: Model<RankBook>,
        @InjectModel(Author.name)
        private readonly authorModel: Model<Author>,
        @InjectModel(Editorial.name)
        private readonly editorialModel: Model<Editorial>,
        private readonly jobsService: JobsService,
    ) {
        this.jobsService.defineJob(this.jobs.rankBooks, async () => {
            const books = await this.bookModel
                .find(null, {
                    _id: 1,
                })
                .exec()
            await Promise.all(
                books.map(async (book) => {
                    const rankBook = await this.rankBookModel
                        .find({
                            book: book._id.toString(),
                        })
                        .exec()
                    if (rankBook.length > 0) {
                        const sumRanking = rankBook.reduce((a, rank) => {
                            return a + rank.ranking
                        }, 0)
                        const promRanking = Number(
                            (sumRanking / rankBook.length).toFixed(),
                        )
                        await this.bookModel
                            .findByIdAndUpdate(
                                book._id,
                                {
                                    $set: {
                                        ranking: promRanking,
                                    },
                                },
                                { new: true },
                            )
                            .exec()
                    }
                }),
            )
        })
        this.doJob()
    }

    private doJob() {
        this.jobsService.repeatEvery(this.jobs.rankBooks, 'one week')
    }

    async isUsedAuthorByImageId(idImage: string) {
        const author = await this.authorModel
            .findOne(
                {
                    image: idImage,
                },
                {
                    _id: 1,
                },
            )
            .exec()
        return author != null
    }

    async isUsedBookByFilesId(idFile: string) {
        const book = await this.bookModel
            .findOne(
                {
                    $or: [
                        {
                            image: idFile,
                        },
                        {
                            book: idFile,
                        },
                    ],
                },
                {
                    _id: 1,
                },
            )
            .exec()
        return book != null
    }

    async isUsedEditorialByImageId(idImage: string) {
        const editorial = await this.bookModel
            .findOne(
                {
                    image: idImage,
                },
                {
                    _id: 1,
                },
            )
            .exec()
        return editorial != null
    }
}
