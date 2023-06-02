import { Inject, Injectable } from '@nestjs/common'
import { ClientProxy } from '@nestjs/microservices'
import { InjectModel } from '@nestjs/mongoose'
import * as moment from 'moment'
import { ObjectId } from 'mongodb'
import { Model } from 'mongoose'
import { NotifyGlobal } from 'src/models/notify.model'
import { KeyValue } from 'src/modules/database/entities/key_value.entity'
import { JobsService } from 'src/modules/jobs/service/jobs.service'
import { Vote } from '../entities/vote.entity'
import { Voting as VotingModel } from '../entities/voting.entity'
import { readFileSync } from 'fs'
import { v4 as uuidv4 } from 'uuid'
import {
    Voting,
    VotingEnumValues,
    VotingKey,
    VotingType,
} from '../models/voting.model'
import { join } from 'path'
import { AwsService } from 'src/modules/aws/service/aws.service'
import { lastValueFrom } from 'rxjs'
import { FileDB } from 'src/models/file.model'
import { User } from 'src/modules/database/entities/user.entity'
import { Role } from 'src/models/roles.model'

@Injectable()
export class VotingService {
    jobs = {
        OPEN_VOTING: 'open voting',
        PROGRESS_VOTING: 'progress voting',
        CLOSE_VOTING: 'close voting',
    }

    constructor(
        @InjectModel(KeyValue.name)
        private readonly keyValueModel: Model<KeyValue>,
        @InjectModel(Vote.name)
        private readonly voteModel: Model<Vote>,
        @InjectModel(VotingModel.name)
        private readonly votingModel: Model<VotingModel>,
        private readonly jobsService: JobsService,
        @Inject('NATS_CLIENT') natsClient: ClientProxy,
        @InjectModel(User.name) private readonly usersModel: Model<User>,
        private readonly awsService: AwsService,
    ) {
        this.jobsService.defineJob(this.jobs.OPEN_VOTING, async () => {
            const status = (await this.keyValueModel
                .findOne({
                    key: VotingKey,
                })
                .exec()) as VotingType
            if (status.value === 'closed')
                await this.keyValueModel
                    .updateOne(
                        {
                            key: VotingKey,
                        },
                        { $set: { value: VotingEnumValues.OPENED } },
                        { new: true },
                    )
                    .exec()
        })
        this.jobsService.defineJob(this.jobs.CLOSE_VOTING, async () => {
            const status = (await this.keyValueModel
                .findOne({
                    key: VotingKey,
                })
                .exec()) as VotingType
            if (status.value === 'in progress') {
                const votes = await this.voteModel
                    .aggregate([
                        {
                            $group: {
                                _id: '$list',
                                count: {
                                    $sum: 1,
                                },
                            },
                        },
                        {
                            $sort: {
                                count: -1,
                            },
                        },
                    ])
                    .exec()
                const voting = await this.votingModel
                    .findOne({
                        lists: {
                            $elemMatch: {
                                _id: new ObjectId(votes[0]._id),
                            },
                        },
                    })
                    .populate('lists.students._id', {
                        name: 1,
                        first_lastname: 1,
                        second_lastname: 1,
                    })
                    .exec()
                const now = moment().format('YYYY-MM-DD')
                const year = moment().format('YYYY')
                const totalVotes = votes.reduce((counter, vote) => {
                    return counter + vote.count
                }, 0)
                // Emit
                // Upload image
                const pathImage = join(
                    __dirname,
                    '../../../assets/images',
                    'voting.png',
                )
                const image = readFileSync(pathImage, 'base64')

                const buff = Buffer.from(image, 'base64')

                const key = `news/${uuidv4()}.png`
                const imageUploaded = await this.awsService.uploadFileAWS(
                    buff,
                    key,
                )
                const fileDB: FileDB = await lastValueFrom(
                    natsClient.send('upload_image', imageUploaded.Key),
                )

                // Upload news with the results
                natsClient.emit('upload_news', {
                    title: `Elecciones estudiantiles ${year}° finalizadas`,
                    headline: `Periodo ${year} ha concluido sus elecciones estudiantiles`,
                    body: `
                        <h1 style="text-align: center">Elecciones estudiantiles finalizadas</h1>
                        <p style="text-align: center"></p>
                        <p style="text-align: justify">Finalizan las elecciones a la fecha de ${now}. Con los siguientes resultados:</p>
                        <p style="text-align: justify"></p>
                        <table class="ProseMirrorTable">
                            <tbody>
                                <tr>
                                    <th colspan="1" rowspan="1">
                                        <p></p>
                                    </th>
                                    ${votes
                                        .map((list) => {
                                            const indexVoting =
                                                voting.lists.findIndex(
                                                    (l) =>
                                                        l._id.toString() ===
                                                        list._id,
                                                )
                                            return `
                                            <th colspan="1" rowspan="1">
                                                <p>${voting.lists[indexVoting].list_name}</p>
                                            </th>
                                        `
                                        })
                                        .join('')}
                                    <th colspan="1" rowspan="1">
                                        <p>Total</p>
                                    </th>
                                </tr>
                                <tr>
                                    <th colspan="1" rowspan="1">
                                        <p>Votos</p>
                                    </th>
                                    ${votes
                                        .map((list) => {
                                            return `
                                            <td colspan="1" rowspan="1">
                                                <p style="text-align: justify">${list.count}</p>
                                            </td>
                                        `
                                        })
                                        .join('')}
                                    <td colspan="1" rowspan="1">
                                        <p>${totalVotes}</p>
                                    </td>
                                </tr>
                                <tr>
                                    <th colspan="1" rowspan="1">
                                        <p>Porcentaje</p>
                                    </th>
                                    ${votes
                                        .map((list) => {
                                            return `
                                            <td colspan="1" rowspan="1">
                                                <p>${
                                                    Number(
                                                        (
                                                            list.count /
                                                            totalVotes
                                                        ).toFixed(2),
                                                    ) * 100
                                                }%</p>
                                            </td>
                                            `
                                        })
                                        .join('')}
                                    <td colspan="1" rowspan="1">
                                        <p style="text-align: center">-</p>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                        <p></p>
                        <p>Por conclusión, queda como lista electa la lista: <strong>${(() => {
                            const first = votes[0]._id
                            const index = voting.lists.findIndex(
                                (l) => l._id.toString() === first,
                            )
                            return voting.lists[index].list_name
                        })()}.</strong></p>
                        <p>De los cuales son integrantes:</p>
                        <p></p>
                        <ul>
                            ${(() => {
                                const first = votes[0]._id
                                const index = voting.lists.findIndex(
                                    (l) => l._id.toString() === first,
                                )
                                return voting.lists[index].students.map(
                                    (student) => {
                                        return `
                                        <li>
                                            <p>
                                                ${student._id.name}
                                                ${student._id.first_lastname}
                                                ${student._id.second_lastname}
                                                (${student.rol})
                                            </p>
                                        </li>
                                        `
                                    },
                                )
                            })().join('')}
                        </ul>
                        <p></p>
                        <p><sub>Periodo: ${voting.period} meses</sub></p>
                    `,
                    img: fileDB._id.$oid,
                    key,
                } as {
                    title: string
                    headline: string
                    body: string
                    img: string
                    key: string
                })
                // Remove user_type to old students
                this.usersModel
                    .updateMany(
                        { user_type: Role.STUDENT_DIRECTIVE },
                        { $set: { user_type: Role.STUDENT } },
                        { new: true },
                    )
                    .exec()
                // Update students
                const index = voting.lists.findIndex(
                    (l) => l._id.toString() === votes[0]._id,
                )
                this.usersModel
                    .updateMany(
                        {
                            $or: voting.lists[index].students.map((student) => {
                                return {
                                    _id: student._id._id,
                                }
                            }),
                        },
                        { user_type: Role.STUDENT_DIRECTIVE },
                        { new: true },
                    )
                    .exec()
                // Delete votes
                this.voteModel.deleteMany({ _id: { $exists: true } }).exec()
                // Update state
                await this.keyValueModel
                    .updateOne(
                        {
                            key: VotingKey,
                        },
                        { $set: { value: VotingEnumValues.CLOSED } },
                        { new: true },
                    )
                    .exec()
            }
        })
        this.jobsService.defineJob(this.jobs.PROGRESS_VOTING, async () => {
            const status = (await this.keyValueModel
                .findOne({
                    key: VotingKey,
                })
                .exec()) as VotingType
            if (status.value === 'uploaded') {
                await this.keyValueModel
                    .updateOne(
                        {
                            key: VotingKey,
                        },
                        { $set: { value: VotingEnumValues.PROGRESS } },
                        { new: true },
                    )
                    .exec()
                natsClient.emit('notify/global', {
                    Title: `Se han abierto las votaciones semestrales`,
                    Type: 'student',
                    Link: '/votar',
                } as NotifyGlobal)
            }
        })
    }

    async openProgressCloseVoting(when: Voting) {
        // Cancel actual jobs
        this.jobsService.cancel({
            $or: [
                {
                    name: this.jobs.CLOSE_VOTING,
                },
                {
                    name: this.jobs.OPEN_VOTING,
                },
                {
                    name: this.jobs.PROGRESS_VOTING,
                },
            ],
        })
        // When´s
        const inHoursClose = moment().diff(when.finish_date, 'hours')
        const whenOpenVoting = moment()
            .add(when.period, 'months')
            .add(inHoursClose, 'hours')
            .toDate()
        const whenProgress = moment(when.start_date).toDate()
        const whenClose = moment(when.finish_date).toDate()

        // Do jobs
        this.jobsService.scheduleJob(whenOpenVoting, this.jobs.OPEN_VOTING)
        this.jobsService.scheduleJob(whenClose, this.jobs.CLOSE_VOTING)
        this.jobsService.scheduleJob(whenProgress, this.jobs.PROGRESS_VOTING)
    }
}
