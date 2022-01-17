import { ExecuteResultType } from "./ExecuteResult";
import { getRequestOutcome, OutcomeAnswer, OutcomeType } from "./Outcome";
import createDummyDataRequest from "./utils/dataRequest";

describe('Outcome', () => {
    describe('getRequestOutcome', () => {
        it('should create an invalid outcome if the request was not succesful', () => {
            const request = createDummyDataRequest({
                executeResult: {
                    type: ExecuteResultType.Error,
                    error: 'err',
                    status: 1,
                },
            });

            const result = getRequestOutcome(request);

            expect(result.type).toBe(OutcomeType.Invalid);
        });

        it('should create an valid outcome with a valid execute result', () => {
            const request = createDummyDataRequest({
                executeResult: {
                    type: ExecuteResultType.Success,
                    data: 'answer',
                    status: 0,
                },
            });

            const result = getRequestOutcome(request);

            expect(result.type).toBe(OutcomeType.Answer);
            expect((result as OutcomeAnswer).answer).toBe('answer');
        });

        it('should create an valid outcome with a valid execute result', () => {
            const request = createDummyDataRequest({
                outcomes: ['test', 'blah'],
                executeResult: {
                    type: ExecuteResultType.Success,
                    data: 'test',
                    status: 0,
                },
            });

            const result = getRequestOutcome(request);

            expect(result.type).toBe(OutcomeType.Answer);
            expect((result as OutcomeAnswer).answer).toBe('test');
        });

        it('should create an invalid outcome with a valid execute result but not in outcomes', () => {
            const request = createDummyDataRequest({
                outcomes: ['test', 'blah'],
                executeResult: {
                    type: ExecuteResultType.Success,
                    data: 'not',
                    status: 0,
                },
            });

            const result = getRequestOutcome(request);

            expect(result.type).toBe(OutcomeType.Invalid);
        });
    });
});