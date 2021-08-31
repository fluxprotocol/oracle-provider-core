import Big from "big.js";

export default function clampBig(num: Big, min: Big, max: Big): Big {
    if (num.lt(min)) {
        return min;
    }

    if (num.gt(max)) {
        return max;
    }

    return num;
}