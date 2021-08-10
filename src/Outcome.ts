import DataRequest from "./DataRequest";
import { isExecuteResultSuccesful } from "./ExecuteResult";

export enum OutcomeType {
    Answer,
    Invalid
}

export interface OutcomeAnswer {
    answer: string;
    type: OutcomeType.Answer;
}

export interface OutcomeInvalid {
    type: OutcomeType.Invalid;
}

export type Outcome = OutcomeAnswer | OutcomeInvalid;

export function isOutcomesEqual(a: Outcome, b: Outcome): boolean {
    if (a.type === OutcomeType.Invalid && b.type === OutcomeType.Invalid) {
        return true;
    }

    if (a.type === OutcomeType.Answer && b.type === OutcomeType.Answer) {
        if (a.answer === b.answer) {
            return true;
        }
    }

    return false;
}

/**
 * Converts the latest execute result to an outcome
 * TODO: We can maybe ditch this and directly create in the provider an answer
 *
 * @export
 * @param {DataRequest} dataRequest
 * @return {JobExecuteResult<Outcome>}
 */
export function getRequestOutcome(dataRequest: DataRequest): Outcome {
    const result = dataRequest.executeResult;

    if (!result || !isExecuteResultSuccesful(result)) {
        return {
            type: OutcomeType.Invalid,
        };
    }

    return {
        type: OutcomeType.Answer,
        answer: result.data,
    };
}
