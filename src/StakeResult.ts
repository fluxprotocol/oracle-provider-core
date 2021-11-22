export enum StakeError {
    NotEnoughBalance = 'NotEnoughBalance',
    Unknown = 'Unknown',
    RequestNotFound = 'RequestNotFound',
    AlreadyBonded = 'AlreadyBonded',
    AlreadyStaked = 'AlreadyStaked',
    AlreadyFinalized = 'AlreadyFinalized',
    TransactionFailure = 'TransactionFailure',
    NotExecuted = 'NotExecuted',
    FinalArbitratorTriggered = 'FinalArbitratorTriggered',
    NotWhitelisted = 'NotWhitelisted',
    FirstPartyRequest = 'FirstPartyRequest',
}

export enum StakeResultType {
    Error = 'error',
    Success = 'success',
}

export interface SuccessfulStakeResult {
    roundId: number;
    amount: string;
    type: StakeResultType.Success;
}

export interface UnsuccessfulStakeResult {
    error: StakeError;
    type: StakeResultType.Error;
}

export type StakeResult = SuccessfulStakeResult | UnsuccessfulStakeResult;

export function isStakeResultSuccesful(result: StakeResult): result is SuccessfulStakeResult {
    return result.type === StakeResultType.Success;
}
