import { chartClass, limitArgs, dataClass, settingsClass } from "../Classes"
import { chisq_quantile, normal_cdf, winsorise, sqrt,
          inv, square, multiply, divide } from '../Functions';

// ESLint errors due to unused input, but needed for agnostic use with other charts
/* eslint-disable */
const smrSE = function(inputData: dataClass): number[] {
  return [];
}
/* eslint-enable */

const smrSEOD = function(inputData: dataClass): number[] {
  const denominator: number[] = inputData.denominator;
  return inv(multiply(2, sqrt(denominator)));
}

// ESLint errors due to unused input, but needed for agnostic use with other charts
/* eslint-disable */
const smrTarget = function(inputData: dataClass): number {
  return 1;
}
/* eslint-enable */

const smrY = function(inputData: dataClass): number[] {
  const numerator: number[] = inputData.numerator;
  const denominator: number[] = inputData.denominator;
  return sqrt(divide(numerator, denominator));
}

const smrLimitOD = function(args: limitArgs) {
  const target: number = args.target_transformed;
  const q: number = args.q;
  const SE: number = args.SE;
  const tau2: number = args.tau2;
  const limit_transformed: number = target + q * sqrt(square(SE) + tau2);
  const limit: number = square(limit_transformed);

  return winsorise(limit, {lower: 0})
}

const smrLimit = function(args: limitArgs) {
  const q: number = args.q;
  const denominator: number = args.denominator;
  const p: number = normal_cdf(q, 0, 1);
  const is_upper: boolean = p > 0.5;
  const offset: number = is_upper ? 1 : 0;

  const limit: number = (chisq_quantile(p, 2 * (denominator + offset)) / 2.0)
                        / denominator;

  return winsorise(limit, {lower: 0})
}

class smrFunnelObject extends chartClass {
  constructor(args: { inputData: dataClass,
                      inputSettings: settingsClass }) {
    super({
      seFunction: smrSE,
      seFunctionOD: smrSEOD,
      targetFunction: smrTarget,
      targetFunctionTransformed: smrTarget,
      yFunction: smrY,
      limitFunction: smrLimit,
      limitFunctionOD: smrLimitOD,
      inputData: args.inputData,
      inputSettings: args.inputSettings
    });
  }
}

export default smrFunnelObject;
