import { IJobWalker, IProviderRegistry, IDatabase, ILogger } from './Core';
import DataRequest from './DataRequest';
import { EnvArgs } from './Provider';

export interface ModuleDependencies {
    database: IDatabase;
    providerRegistry: IProviderRegistry;
    jobWalker: IJobWalker;
    logger: ILogger;
}

export default class Module {
    static moduleName: string = 'module';

    constructor(public config: EnvArgs, public dependencies: ModuleDependencies) {}

    /**
     * Initializes the module.
     *
     * @return {Promise<void>}
     * @memberof Module
     */
    async init(): Promise<void> {
        return Promise.resolve();
    }

    /**
     * Calls the module with the request from the job walker
     * Each module can do whatever they want with the request
     *
     * @param {Request} request
     * @param {(request: Request) => void} next
     * @return {Promise<void>}
     * @memberof Module
     */
    async call(request: DataRequest, next: (request: DataRequest) => void): Promise<void> {
        next(request);
    }

    /**
     * Calls this each x amount of time. Used for sheduling requests or updating logs.
     *
     * @return {Promise<void>}
     * @memberof Module
     */
    async tick(timeSinceLastTick: number): Promise<void> {
        return Promise.resolve();
    }
}
