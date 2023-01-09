import { Controller, UseInterceptors } from '@nestjs/common'
import { EventPattern, Payload } from '@nestjs/microservices'
import { LoggerInterceptor } from 'src/logger.interceptor'
import { Voting } from '../models/voting.model'
import { VotingService } from '../service/voting.service'

@UseInterceptors(LoggerInterceptor)
@Controller('voting')
export class VotingController {
    constructor(private readonly votingService: VotingService) {}

    @EventPattern('open_close_voting')
    openVoting(@Payload() when: Voting) {
        this.votingService.openProgressCloseVoting(when)
    }
}
