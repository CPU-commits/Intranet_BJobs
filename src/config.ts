import { registerAs } from '@nestjs/config'

type NodeEnv = 'dev' | 'prod'

export default registerAs('config', () => {
    return {
        nats: process.env.NATS_HOST,
        mongo: {
            dbName: process.env.MONGO_DB,
            host: process.env.MONGO_HOST,
            user: process.env.MONGO_ROOT_USERNAME,
            password: process.env.MONGO_ROOT_PASSWORD,
            port: parseInt(process.env.MONGO_PORT, 10),
            connection: process.env.MONGO_CONNECTION,
        },
        aws: {
            bucket: process.env.AWS_BUCKET,
        },
        host: process.env.HOSTNAME,
        nodeEnv: process.env.NODE_ENV as NodeEnv,
    }
})
