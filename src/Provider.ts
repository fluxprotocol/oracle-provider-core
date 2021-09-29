import Balance from './Balance';
import { ClaimResult } from './ClaimResult';
import { IDatabase } from './Core';
import DataRequest from './DataRequest';
import { Outcome } from './Outcome';
import { StakeResult } from './StakeResult';

export interface EnvArgs {
    [key: string]: string | undefined;
}

export interface ProviderDependencies {
    database: IDatabase;
}

export default interface Provider {
    providerName: string;
    id: string;

    init(): Promise<void>;

    getBalanceInfo(): Promise<Balance>;
    getDataRequestById(requestId: string): Promise<DataRequest | undefined>;
    listenForRequests(onRequests: (requests: DataRequest[]) => void): void;

    /**
     * Stake on the data request
     * Amount staken is determined by the provider itself
     * 
     * @param {DataRequest} request
     * @param {Outcome} answer
     * @return {Promise<StakeResponse>}
     * @memberof Provider
     */
    stake(request: DataRequest, answer: Outcome): Promise<StakeResult>;
    claim(request: DataRequest): Promise<ClaimResult>;
    finalize(request: DataRequest): Promise<boolean>;

    sync(startingRequestId: string | undefined, onRequest: (request: DataRequest) => void): Promise<void>;
}
