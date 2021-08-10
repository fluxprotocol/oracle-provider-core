import createDummyDataRequest from "./utils/dataRequest";
import { isClaimResultSuccesful } from "./ClaimResult";
import { getCurrentResolutionWindow, isRequestClaimable, isRequestDeletable, mergeRequests } from "./DataRequest";
import { OutcomeType } from "./Outcome";
import { StakeResultType } from "./StakeResult";


describe('DataRequest', () => {
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

        it('should be claimable when the current date exceeds the end time', () => {
            const request = createDummyDataRequest({
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
                },{
                    bondSize: '4',
                    endTime: new Date(1),
                    round: 1,
                    bondedOutcome: {
                        type: OutcomeType.Invalid,
                    },
                }],
            });

            expect(isRequestClaimable(request)).toBe(true);
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
        it('should return true when the final arbitrator has been triggered', () => {
            const request = createDummyDataRequest({
                finalArbitratorTriggered: true,
            });

            expect(isRequestDeletable(request)).toBe(true);
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

        it('should be claimable when the current date exceeds the end time', () => {
            const request = createDummyDataRequest({
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
                }, {
                    bondSize: '4',
                    endTime: new Date(1),
                    round: 1,
                    bondedOutcome: {
                        type: OutcomeType.Invalid,
                    },
                }],
            });

            expect(isRequestClaimable(request)).toBe(true);
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
});