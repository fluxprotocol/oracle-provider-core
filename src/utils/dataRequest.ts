import DataRequest from '../DataRequest';

export default function createDummyDataRequest(request: Partial<DataRequest>): DataRequest {
    return {
        dataType: request.dataType ?? { type: 'string' },
        finalArbitratorTriggered: request.finalArbitratorTriggered ?? false,
        id: request.id ?? '1',
        internalId: request.internalId ?? 'near_test.near_1',
        outcomes: request.outcomes ?? [],
        providerId: request.providerId ?? 'near',
        resolutionWindows: request.resolutionWindows ?? [],
        sources: request.sources ?? [],
        staking: request.staking ?? [],
        config: {
            paidFee: '0',
            validityBond: '0',
            minResolutionBond: '100000000000000000000',
            ...request.config,
        },
        requiredEnvVariables: [],
        requester: '',
        tags: [],
        allowedValidators: [],
        ...request,
    }
}