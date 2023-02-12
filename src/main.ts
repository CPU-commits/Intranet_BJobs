import { NestFactory } from '@nestjs/core'
import { MicroserviceOptions, Transport } from '@nestjs/microservices'
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston'
import { AppModule } from './app.module'
import { getNatsServers } from './utils/get_nats_servers'

async function bootstrap() {
    // App
    const app = await NestFactory.create(AppModule)
    // Logger
    app.useLogger(app.get(WINSTON_MODULE_NEST_PROVIDER))
    // Nats Microservice
    app.connectMicroservice<MicroserviceOptions>({
        transport: Transport.NATS,
        options: {
            servers: getNatsServers(),
            queue: 'jobs',
        },
    })
    await app.startAllMicroservices()
    // Start server
    await app.listen(3000)
}
bootstrap()
