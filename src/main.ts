import { NestFactory } from '@nestjs/core'
import { MicroserviceOptions, Transport } from '@nestjs/microservices'
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston'
import { AppModule } from './app.module'
import config from './config'

async function bootstrap() {
    // Config
    const configService = config()
    // App
    const app = await NestFactory.create(AppModule)
    // Logger
    app.useLogger(app.get(WINSTON_MODULE_NEST_PROVIDER))
    // Nats Microservice
    app.connectMicroservice<MicroserviceOptions>({
        transport: Transport.NATS,
        options: {
            servers: [`nats://${configService.nats}:4222`],
            queue: 'jobs',
        },
    })
    await app.startAllMicroservices()
    // Start server
    await app.listen(3000)
}
bootstrap()
