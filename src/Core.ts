import Balance from "./Balance";
import { ClaimResult } from "./ClaimResult";
import DataRequest from "./DataRequest";
import { Outcome } from "./Outcome";
import Provider from "./Provider";
import { StakeResult } from "./StakeResult";

export interface IJobWalker {
    requests: Map<string, DataRequest>;
    processingIds: Map<string, Promise<void>>;

    addNewDataRequest(request: DataRequest): Promise<void>;
    walkRequest(input: DataRequest): Promise<void>;
    walkAllRequests(): Promise<void>;
    stopWalker(): Promise<void>;
    startWalker(): void;
}

export interface IProviderRegistry {
    providers: Provider[];
    activeProviders: string[];

    getProviderById(id: string): Provider | undefined;
    getAccountIdByProvider(providerId: string): string;
    init(): Promise<void>;
    getBalanceInfo(providerId: string): Promise<Balance>;
    listenForRequests(onRequests: (requests: DataRequest[], providerId: string) => void): void;
    getDataRequestById(providerId: string, requestId: string): Promise<DataRequest | undefined>;
    stake(providerId: string, request: DataRequest, answer: Outcome): Promise<StakeResult>;
    finalize(providerId: string, request: DataRequest): Promise<boolean>;
    claim(providerId: string, request: DataRequest): Promise<ClaimResult>;
}

export const DB_TABLE_DATA_REQUESTS = 'data_requests';
export const DB_TABLE_SYNC = 'sync';
export const DB_TABLE_BALANCES = 'balances';

export interface IDatabase {
    startDatabase(dbPath: string, dbName: string): Promise<any>;
    createDocument(tableKey: string, id: string, obj: object): Promise<void>;
    deleteDocument(tableKey: string, id: string): Promise<void>;
    findDocumentById<T>(tableKey: string, id: string): Promise<T | null>;
    getAllFromTable<T>(tableKey: string): Promise<T[]>;
    createOrUpdateDocument(tableKey: string, id: string, obj: object): Promise<void>;
}

export interface ILogger {
    debug(message: string): void;
    info(message: string): void;
    warn(message: string): void;
    error(message: string): void;
}