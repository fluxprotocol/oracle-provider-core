import Big from "big.js";
import { DataRequestDataType } from "./DataRequestDataType";
import { ExecuteResult } from "./ExecuteResult";
import { getRequestOutcome, isOutcomesEqual, Outcome } from "./Outcome";
import ResolutionWindow from "./ResolutionWindow";
import { StakeError, SuccessfulStakeResult } from "./StakeResult";
import clampBig from "./utils/clampBig";

Big.PE = 100_000;

export interface RequestInfo {
    end_point: string;
    source_path: string;
}

export interface RequestConfig {
    validityBond: string;
    paidFee: string;
    stakeMultiplier?: number;
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
    config: RequestConfig;
    metadata?: string;
    paidFee?: string;
}

export function getCurrentResolutionWindow(request: DataRequest) {
    return request.resolutionWindows[request.resolutionWindows.length - 1];
}

export function calcWindowBondSize(requestConfig: RequestConfig): string {
    let bond_size = new Big(requestConfig.validityBond);

    if (new Big(requestConfig.paidFee).gte(requestConfig.validityBond)) {
        bond_size = new Big(requestConfig.paidFee);
    }

    // Use the multiplier according to multiply_stake in the oracle
    if (requestConfig.stakeMultiplier) {
        bond_size = bond_size.mul(requestConfig.stakeMultiplier).div(10_000).round(0);
    }

    // Multily by 2 according to ResolutionWindow::new in the oracle
    return bond_size.mul(2).toString();
}

/**
 * Calculates the amount of stake that should be used for this request
 *
 * @export
 * @param {DataRequest} request
 * @param {string} balance The current amount of balance
 * @param {string} maxAmount The maximum we can spend on a window
 * @param {number} balanceDivider Divides the balance in smaller pieces so we can diversify our stake (percentage in 0.01 - 1)
 * @return {string}
 */
export function calcStakeAmount(request: DataRequest, balance: string, maxAmount: string, balanceDivider: number = 1): string {
    const maxStakeAmount = new Big(maxAmount);
    const currentWindow = getCurrentResolutionWindow(request);
    const bondSize = new Big(currentWindow ? currentWindow.bondSize : calcWindowBondSize(request.config));
    
    const stakeAmount = clampBig(bondSize, new Big(1), maxStakeAmount);

    if (stakeAmount.gt(balance)) {
        // Divides the stake in smaller chunks so we can diversify
        return new Big(balance).mul(balanceDivider).round(0, 0).toString();
    }

    return stakeAmount.toString();
}

export function isRequestFinalizable(request: DataRequest) {
    const currentWindow = getCurrentResolutionWindow(request);

    if (!currentWindow) {
        return false;
    }

    if (request.finalizedOutcome) {
        return false;
    }

    if (request.finalArbitratorTriggered) {
        return false;
    }

    // Atleast one window must be bonded
    if (request.resolutionWindows.length < 2) {
        return false;
    }

    // Our node has to atleast try if it can dispute it.
    // We assume that if it was executed that the node tries to execute it and immidiatly stake
    if (!request.executeResult) {
        return false;
    }

    const previousWindow = request.resolutionWindows[request.resolutionWindows.length - 2];

    // We don't agree with the bonded outcome
    // We give the node a chance to dispute it so we don't finalize
    if (previousWindow?.bondedOutcome) {
        if (!isOutcomesEqual(getRequestOutcome(request), previousWindow.bondedOutcome)) {
            return false;
        }
    }

    const now = new Date();

    if (now.getTime() >= new Date(currentWindow.endTime).getTime()) {
        return true;
    }
    
    return false;
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