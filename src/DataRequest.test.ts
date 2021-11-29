import createDummyDataRequest from "./utils/dataRequest";
import { calcStakeAmount, getCurrentResolutionWindow, isRequestClaimable, isRequestDeletable, isRequestFinalizable, mergeRequests } from "./DataRequest";
import { OutcomeType } from "./Outcome";
import { StakeResultType } from "./StakeResult";
import { toToken } from "./Token";
import { ExecuteResultType } from "./ExecuteResult";


describe('DataRequest', () => {
    describe('calcStakeAmount', () => {

        it('Should stake a minimum of 1 if the config has a validity bond of 0', () => {
            const request = createDummyDataRequest({
                resolutionWindows: [],
                config: {
                    paidFee: '0',
                    validityBond: '0',
                    minResolutionBond: '100000000000000000000',
                },
            });

            const amount = calcStakeAmount(request, toToken('10', 24), toToken('8', 24));

            expect(amount).toBe('200000000000000000000');
        });

        it('Should give back 0 if the balance is 0', () => {
            const request = createDummyDataRequest({
                resolutionWindows: [],
                config: {
                    paidFee: '0',
                    validityBond: '5000000000000000000000000',
                    minResolutionBond: '100000000000000000000',
                },
            });

            const amount = calcStakeAmount(request, toToken('0', 24), toToken('8', 24));

            expect(amount).toBe('0');
        });
        
        it('Should stake all the balance when the bond is too high', () => {
            const request = createDummyDataRequest({
                resolutionWindows: [],
                config: {
                    paidFee: '0',
                    validityBond: '5000000000000000000000000',
                    minResolutionBond: '100000000000000000000',
                },
            });

            const amount = calcStakeAmount(request, toToken('3', 24), toToken('8', 24));

            expect(amount).toBe('3000000000000000000000000');
        });

        it('Should stake half of the balance when the bond is too high and the divider is 0.5', () => {
            const request = createDummyDataRequest({
                resolutionWindows: [],
                config: {
                    paidFee: '0',
                    validityBond: '5000000000000000000000000',
                    minResolutionBond: '100000000000000000000',
                },
            });

            const amount = calcStakeAmount(request, toToken('3', 24), toToken('8', 24), 0.5);

            expect(amount).toBe('1500000000000000000000000');
        });

        it('Should stake the correct amount when there is no windows', () => {
            const request = createDummyDataRequest({
                resolutionWindows: [],
                config: {
                    paidFee: '0',
                    validityBond: '1000000000000000000000000',
                    minResolutionBond: '100000000000000000000',
                },
            });

            const amount = calcStakeAmount(request, toToken('100', 24), toToken('8', 24));

            expect(amount).toBe('2000000000000000000000000');
        });

        it('Should stake the correct amount when there is no windows and there is a multiplier', () => {
            const request = createDummyDataRequest({
                resolutionWindows: [],
                config: {
                    paidFee: '0',
                    validityBond: '1000000000000000000000000',
                    stakeMultiplier: 10_500, // 105%
                    minResolutionBond: '100000000000000000000',
                },
            });

            const amount = calcStakeAmount(request, toToken('100', 24), toToken('8', 24));

            expect(amount).toBe('2100000000000000000000000');
        });

        it('Should stake the correct amount when there is no windows and the paid fee is higher than the bond', () => {
            const request = createDummyDataRequest({
                resolutionWindows: [],
                config: {
                    paidFee: '2000000000000000000000000',
                    validityBond: '1000000000000000000000000',
                    minResolutionBond: '100000000000000000000',
                },
            });

            const amount = calcStakeAmount(request, toToken('100', 24), toToken('8', 24));

            expect(amount).toBe('4000000000000000000000000');
        });

        it('Should stake the correct amount when there is 2 windows', () => {
            const request = createDummyDataRequest({
                resolutionWindows: [{
                    bondSize: toToken('2', 24),
                    endTime: new Date(1),
                    round: 0,
                    bondedOutcome: { type: OutcomeType.Invalid },
                }, {
                    bondSize: toToken('4', 24),
                    endTime: new Date(1),
                    round: 0,
                }],
                config: {
                    paidFee: '0',
                    validityBond: toToken('1', 24),
                    minResolutionBond: '100000000000000000000',
                },
            });

            const amount = calcStakeAmount(request, toToken('100', 24), toToken('8', 24));

            expect(amount).toBe('4000000000000000000000000');
        });

        it('Should stake the correct amount when there is 2 windows but the stake is higher than the max', () => {
            const request = createDummyDataRequest({
                resolutionWindows: [{
                    bondSize: toToken('2', 24),
                    endTime: new Date(1),
                    round: 0,
                    bondedOutcome: { type: OutcomeType.Invalid },
                }, {
                    bondSize: toToken('4', 24),
                    endTime: new Date(1),
                    round: 0,
                }],
                config: {
                    paidFee: '0',
                    validityBond: toToken('1', 24),
                    minResolutionBond: '100000000000000000000',
                },
            });

            const amount = calcStakeAmount(request, toToken('100', 24), toToken('3.5', 24));

            expect(amount).toBe('3500000000000000000000000');
        });
    });

    describe('getCurrentResolutionWindow', () => {
        it('should always return the latest resolutionWindow', () => {
            const request = createDummyDataRequest({
                resolutionWindows: [{
                    round: 0,
                    endTime: new Date(),
                    bondSize: '2',
                }, {
                    round: 1,
                    endTime: new Date(),
                    bondSize: '2',
                }],
            });

            expect(getCurrentResolutionWindow(request)?.round).toBe(1);
        });
    });

    describe('isClaimable', () => {
        it('should not be claimable when the request was already claimed', () => {
            const request = createDummyDataRequest({
                claimedAmount: '1',
                resolutionWindows: [{
                    bondSize: '2',
                    endTime: new Date(1),
                    round: 0,
                    bondedOutcome: {
                        type: OutcomeType.Invalid,
                    },
                }],
                staking: [{
                    amount: '2',
                    roundId: 0,
                    type: StakeResultType.Success,
                }],
            });

            expect(isRequestClaimable(request)).toBe(false);
        });

        it('should not be claimable when the request was not staked on', () => {
            const request = createDummyDataRequest({
                claimedAmount: '1',
                staking: [{
                    amount: '1',
                    roundId: 0,
                    type: StakeResultType.Success,
                }],
                resolutionWindows: [{
                    bondSize: '2',
                    endTime: new Date(1),
                    round: 0,
                    bondedOutcome: {
                        type: OutcomeType.Invalid,
                    },
                }],
            });

            expect(isRequestClaimable(request)).toBe(false);
        });

        it('should not be claimable when the request has no windows', () => {
            const request = createDummyDataRequest({
                resolutionWindows: [],
            });

            expect(isRequestClaimable(request)).toBe(false);
        });

        it('should not be calimable when the request only has one window', () => {
            const request = createDummyDataRequest({
                resolutionWindows: [{
                    bondSize: '2',
                    endTime: new Date(1),
                    round: 0,
                    bondedOutcome: {
                        type: OutcomeType.Invalid,
                    },
                }],
            });

            expect(isRequestClaimable(request)).toBe(false);
        });

        it('should not be claimable as a default', () => {
            const request = createDummyDataRequest({
                staking: [{
                    amount: '1',
                    roundId: 0,
                    type: StakeResultType.Success,
                }],
                resolutionWindows: [{
                    bondSize: '2',
                    endTime: new Date(new Date().getTime() + 100000),
                    round: 0,
                    bondedOutcome: {
                        type: OutcomeType.Invalid,
                    },
                }],
            });

            expect(isRequestClaimable(request)).toBe(false);
        });
    });

    describe('mergeRequests', () => {
        it('should update the rounds when given a new datarequest', () => {
            const request = createDummyDataRequest({
                id: '1',
                resolutionWindows: [{
                    endTime: new Date(),
                    round: 0,
                    bondSize: '2',
                }],
            });

            const result = mergeRequests(request, createDummyDataRequest({
                resolutionWindows: [{
                    endTime: new Date(),
                    round: 0,
                    bondSize: '2',
                }, {
                    endTime: new Date(),
                    round: 1,
                    bondSize: '2',
                }],
            }));

            expect(result.resolutionWindows.length).toBe(2);
        });
    });

    describe('isDeletable', () => {
        it('should return false when the final arbitrator has been triggered', () => {
            const request = createDummyDataRequest({
                finalArbitratorTriggered: true,
            });

            expect(isRequestDeletable(request)).toBe(false);
        });

        it('should return true when the request was already claimed and a finalized outcome is there', () => {
            const request = createDummyDataRequest({
                finalizedOutcome: {
                    type: OutcomeType.Invalid,
                },
                claimedAmount: '1',
            });

            expect(isRequestDeletable(request)).toBe(true);
        });

        it('should return false when it has not been claimed yet', () => {
            const request = createDummyDataRequest({
                finalizedOutcome: {
                    type: OutcomeType.Invalid,
                },
                resolutionWindows: [{
                    bondSize: '2',
                    endTime: new Date(),
                    round: 0,
                }, {
                    bondSize: '4',
                    endTime: new Date(),
                    round: 1,
                }],
                staking: [{
                    amount: '1',
                    roundId: 0,
                    type: StakeResultType.Success,
                }],
            });

            expect(isRequestDeletable(request)).toBe(false);
        });

        it('should return false when there is no finalized outcome and the final arbitrator has not been triggered', () => {
            const request = createDummyDataRequest({});

            expect(isRequestDeletable(request)).toBe(false);
        });
    });

    describe('isClaimable', () => {
        it('should not be claimable when the request was already claimed', () => {
            const request = createDummyDataRequest({
                claimedAmount: '1',
                resolutionWindows: [{
                    bondSize: '2',
                    endTime: new Date(1),
                    round: 0,
                    bondedOutcome: {
                        type: OutcomeType.Invalid,
                    },
                }],
                staking: [{
                    amount: '2',
                    roundId: 0,
                    type: StakeResultType.Success,
                }],
            });

            expect(isRequestClaimable(request)).toBe(false);
        });

        it('should not be claimable when the request was not staked on', () => {
            const request = createDummyDataRequest({
                claimedAmount: '1',
                staking: [{
                    amount: '1',
                    roundId: 0,
                    type: StakeResultType.Success,
                }],
                resolutionWindows: [{
                    bondSize: '2',
                    endTime: new Date(1),
                    round: 0,
                    bondedOutcome: {
                        type: OutcomeType.Invalid,
                    },
                }],
            });

            expect(isRequestClaimable(request)).toBe(false);
        });

        it('should not be claimable when the request has no windows', () => {
            const request = createDummyDataRequest({
                resolutionWindows: [],
            });

            expect(isRequestClaimable(request)).toBe(false);
        });

        it('should not be calimable when the request only has one window', () => {
            const request = createDummyDataRequest({
                resolutionWindows: [{
                    bondSize: '2',
                    endTime: new Date(1),
                    round: 0,
                    bondedOutcome: {
                        type: OutcomeType.Invalid,
                    },
                }],
            });

            expect(isRequestClaimable(request)).toBe(false);
        });

        it('should not be claimable as a default', () => {
            const request = createDummyDataRequest({
                staking: [{
                    amount: '1',
                    roundId: 0,
                    type: StakeResultType.Success,
                }],
                resolutionWindows: [{
                    bondSize: '2',
                    endTime: new Date(new Date().getTime() + 100000),
                    round: 0,
                    bondedOutcome: {
                        type: OutcomeType.Invalid,
                    },
                }],
            });

            expect(isRequestClaimable(request)).toBe(false);
        });
    });

    describe('isRequestFinalizable', () => {
        it('should be finalised when possible', () => {
            const request = createDummyDataRequest({
                resolutionWindows: [
                {
                    bondSize: '2',
                    endTime: new Date(new Date().getTime() - 10000),
                    round: 0,
                    bondedOutcome: {
                        type: OutcomeType.Invalid,
                    },
                },{
                    bondSize: '4',
                    endTime: new Date(new Date().getTime() - 100),
                    round: 1,
                    bondedOutcome: undefined
                }],
                executeResult: {
                    type: ExecuteResultType.Error,
                    status: 1,
                    error: '',
                },
                staking: [],
            });

            const result = isRequestFinalizable(request, 'test.near');

            expect(result).toBe(true);
        });
    });
});