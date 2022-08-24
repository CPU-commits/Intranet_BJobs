import { BadRequestException, Inject, Injectable } from '@nestjs/common'
import { ConfigType } from '@nestjs/config'
import { S3 } from 'aws-sdk'
import { Error } from 'aws-sdk/clients/s3'
import config from 'src/config'

@Injectable()
export class AwsService {
    private s3 = new S3()

    constructor(
        @Inject(config.KEY) private configService: ConfigType<typeof config>,
    ) {}

    async uploadFileAWS(
        file: Buffer,
        Key: string,
    ): Promise<S3.ManagedUpload.SendData> {
        const params = {
            Bucket: this.configService.aws.bucket,
            Key,
            Body: file,
        }
        const fileUploaded = await this.s3
            .upload(params)
            .promise()
            .then((data) => {
                return data
            })
            .catch((error: Error) => {
                throw new BadRequestException(error.Message)
            })
        return fileUploaded
    }

    async deleteFileAWS(Key: string) {
        const params = {
            Bucket: this.configService.aws.bucket,
            Key,
        }
        const fileDeleted = await this.s3
            .deleteObject(params)
            .promise()
            .then((data) => {
                return data
            })
            .catch((error: Error) => {
                throw new BadRequestException(error.Message)
            })
        return fileDeleted
    }

    async listObjects(start?: string) {
        const params = {
            Bucket: this.configService.aws.bucket,
            StartAfter: start,
        }
        const objects = await this.s3
            .listObjectsV2(params)
            .promise()
            .then((data) => {
                return data
            })
            .catch((error: Error) => {
                throw new Error(error.Message)
            })
        return objects
    }
}
