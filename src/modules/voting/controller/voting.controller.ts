import { Controller } from '@nestjs/common'
import { EventPattern, Payload } from '@nestjs/microservices'
import { Voting } from '../models/voting.model'
import { VotingService } from '../service/voting.service'

@Controller('voting')
export class VotingController {
    constructor(private readonly votingService: VotingService) {}

    @EventPattern('open_close_voting')
    openVoting(@Payload() when: Voting) {
        this.votingService.openProgressCloseVoting(when)
    }
}
