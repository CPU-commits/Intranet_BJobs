export const VotingKey = 'voting'
export enum VotingValues {
    'opened',
    'uploaded',
    'in progress',
    'closed',
}
export enum VotingEnumValues {
    OPENED = 'opened',
    UPLOADED = 'uploaded',
    PROGRESS = 'in progress',
    CLOSED = 'closed',
}

export type Voting = {
    start_date: string
    finish_date: string
    period: number
}

export class VotingType {
    key: typeof VotingKey
    value: keyof typeof VotingValues
}
