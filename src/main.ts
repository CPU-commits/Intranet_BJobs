import { NestFactory } from '@nestjs/core'
import { MicroserviceOptions, Transport } from '@nestjs/microservices'
import { AppModule } from './app.module'
import config from './config'

async function bootstrap() {
    // Config
    const configService = config()
    // App
    const app = await NestFactory.createMicroservice<MicroserviceOptions>(
        AppModule,
        {
            transport: Transport.NATS,
            options: {
                servers: [`nats://${configService.nats}:4222`],
            },
        },
    )
    await app.listen()
}
bootstrap()
