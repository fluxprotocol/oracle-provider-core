import { Outcome } from "./Outcome";

export default interface ResolutionWindow {
    round: number;
    bondedOutcome?: Outcome;
    endTime: Date;
    bondSize: string;
}
