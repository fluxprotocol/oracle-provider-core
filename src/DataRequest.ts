import { DataRequestDataType } from "./DataRequestDataType";
import { ExecuteResult } from "./ExecuteResult";
import { getRequestOutcome, isOutcomesEqual, Outcome } from "./Outcome";
import ResolutionWindow from "./ResolutionWindow";
import { StakeError, SuccessfulStakeResult } from "./StakeResult";

export interface RequestInfo {
    end_point: string;
    source_path: string;
}

export default interface DataRequest {
    id: string;
    internalId: string;
    providerId: string;
    outcomes: string[];
    sources: RequestInfo[];
    resolutionWindows: ResolutionWindow[];
    finalArbitratorTriggered: boolean;
    executeResult?: ExecuteResult;
    staking: SuccessfulStakeResult[];
    finalizedOutcome?: Outcome;
    claimedAmount?: string;
    dataType: DataRequestDataType;
    metadata?: string;
    paidFee?: string;
}

export function getCurrentResolutionWindow(request: DataRequest) {
    return request.resolutionWindows[request.resolutionWindows.length - 1];
}

/**
 * Checks if the data request can be finalized and claimed
 *
 * @export
 * @param {DataRequest} request
 * @return {boolean}
 */
export function isRequestClaimable(request: DataRequest): boolean {
    const currentWindow = getCurrentResolutionWindow(request);

    if (!currentWindow) {
        return false;
    }

    // When we have nothing to stake we can not claim
    if (request.staking.length === 0) {
        return false;
    }

    if (request.claimedAmount) {
        return false;
    }

    // Window 0 must be bonded
    // This makes some things fail...
    if (request.resolutionWindows.length < 2) {
        return false;
    }

    const now = new Date();

    if (now.getTime() >= new Date(currentWindow.endTime).getTime()) {
        return true;
    }

    return false;
}

/**
 * Checks if all actions has been done on the request and we can safely delete it
 *
 * @export
 * @param {DataRequest} request
 * @return {boolean}
 */
export function isRequestDeletable(request: DataRequest): boolean {
    if (request.claimedAmount) {
        return true;
    }

    if (request.finalArbitratorTriggered) {
        return true;
    }

    if (request.finalizedOutcome && !isRequestClaimable(request)) {
        return true;
    }

    return false;
}

export function isRequestExecutable(request: DataRequest) {
    // For now a request is always executable
    // Can implement settlement times later..
    return true;
}

export function buildInternalId(id: string, provider: string, contract: string) {
    return `${id}_${provider}_${contract}`;
}

export function mergeRequests(oldRequest: DataRequest, newRequest: DataRequest): DataRequest {
    const result: DataRequest = { ...oldRequest };

    result.resolutionWindows = newRequest.resolutionWindows;
    result.finalizedOutcome = newRequest.finalizedOutcome;
    result.finalArbitratorTriggered = newRequest.finalArbitratorTriggered;
    result.paidFee = newRequest.paidFee;

    return result;
}

export interface CanStakeResponse {
    canStake: boolean;
    reason?: StakeError;
}

export function canStakeOnRequest(request: DataRequest): CanStakeResponse {
    if (request.finalArbitratorTriggered) {
        return {
            canStake: false,
            reason: StakeError.FinalArbitratorTriggered,
        }
    }

    if (!request.executeResult) {
        return {
            canStake: false,
            reason: StakeError.NotExecuted,
        };
    }

    if (request.finalizedOutcome) {
        return {
            canStake: false,
            reason: StakeError.AlreadyFinalized,
        };
    }

    const currentWindow = getCurrentResolutionWindow(request);

    // We are the first one to stake
    // So we can safely stake
    if (!currentWindow) {
        return {
            canStake: true,
        }
    }

    const hasStaked = request.staking.some(stake => stake.roundId === currentWindow.round);

    if (hasStaked) {
        return {
            canStake: false,
            reason: StakeError.AlreadyStaked,
        }
    }

    const previousWindow = request.resolutionWindows[request.resolutionWindows.length - 2];

    if (previousWindow && previousWindow.bondedOutcome) {
        if (isOutcomesEqual(previousWindow.bondedOutcome, getRequestOutcome(request))) {
            return {
                canStake: false,
                reason: StakeError.AlreadyBonded,
            };
        }
    }

    return {
        canStake: true,
    };
}