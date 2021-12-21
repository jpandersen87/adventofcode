const testInputStr = `3,4,3,1,2`;
const testExpectedStr = `Initial state: 3,4,3,1,2
After  1 day:  2,3,2,0,1
After  2 days: 1,2,1,6,0,8
After  3 days: 0,1,0,5,6,7,8
After  4 days: 6,0,6,4,5,6,7,8,8
After  5 days: 5,6,5,3,4,5,6,7,7,8
After  6 days: 4,5,4,2,3,4,5,6,6,7
After  7 days: 3,4,3,1,2,3,4,5,5,6
After  8 days: 2,3,2,0,1,2,3,4,4,5
After  9 days: 1,2,1,6,0,1,2,3,3,4,8
After 10 days: 0,1,0,5,6,0,1,2,2,3,7,8
After 11 days: 6,0,6,4,5,6,0,1,1,2,6,7,8,8,8
After 12 days: 5,6,5,3,4,5,6,0,0,1,5,6,7,7,7,8,8
After 13 days: 4,5,4,2,3,4,5,6,6,0,4,5,6,6,6,7,7,8,8
After 14 days: 3,4,3,1,2,3,4,5,5,6,3,4,5,5,5,6,6,7,7,8
After 15 days: 2,3,2,0,1,2,3,4,4,5,2,3,4,4,4,5,5,6,6,7
After 16 days: 1,2,1,6,0,1,2,3,3,4,1,2,3,3,3,4,4,5,5,6,8
After 17 days: 0,1,0,5,6,0,1,2,2,3,0,1,2,2,2,3,3,4,4,5,7,8
After 18 days: 6,0,6,4,5,6,0,1,1,2,6,0,1,1,1,2,2,3,3,4,6,7,8,8,8,8`;
const inputStr = `2,5,3,4,4,5,3,2,3,3,2,2,4,2,5,4,1,1,4,4,5,1,2,1,5,2,1,5,1,1,1,2,4,3,3,1,4,2,3,4,5,1,2,5,1,2,2,5,2,4,4,1,4,5,4,2,1,5,5,3,2,1,3,2,1,4,2,5,5,5,2,3,3,5,1,1,5,3,4,2,1,4,4,5,4,5,3,1,4,5,1,5,3,5,4,4,4,1,4,2,2,2,5,4,3,1,4,4,3,4,2,1,1,5,3,3,2,5,3,1,2,2,4,1,4,1,5,1,1,2,5,2,2,5,2,4,4,3,4,1,3,3,5,4,5,4,5,5,5,5,5,4,4,5,3,4,3,3,1,1,5,2,4,5,5,1,5,2,4,5,4,2,4,4,4,2,2,2,2,2,3,5,3,1,1,2,1,1,5,1,4,3,4,2,5,3,4,4,3,5,5,5,4,1,3,4,4,2,2,1,4,1,2,1,2,1,5,5,3,4,1,3,2,1,4,5,1,5,5,1,2,3,4,2,1,4,1,4,2,3,3,2,4,1,4,1,4,4,1,5,3,1,5,2,1,1,2,3,3,2,4,1,2,1,5,1,1,2,1,2,1,2,4,5,3,5,5,1,3,4,1,1,3,3,2,2,4,3,1,1,2,4,1,1,1,5,4,2,4,3`;
const testInput = testInputStr.split(",").map(x => parseInt(x));
const input = inputStr.split(",").map(x => parseInt(x));
function calcFishDays(currentState, isHistory = false, numDays = 18) {
    const calcDayArr = (state) => {
        const curr = state.map(x => {
            if (x === 0) {
                return 6;
            }
            return x - 1;
        });
        state.filter(x => x === 0).forEach(_ => curr.push(8));
        return curr;
    };
    const calcDayMap = (state) => {
        const arrIter = Array.from(Array(9));
        const dayMap = Array.isArray(state) ? arrIter.reduce((m, _, i) => {
            m[i] = state.filter(x => x === i).length;
            return m;
        }, {}) : Object.assign({}, state);
        const newNum = dayMap["0"];
        dayMap["0"] = dayMap["1"];
        dayMap["1"] = dayMap["2"];
        dayMap["2"] = dayMap["3"];
        dayMap["3"] = dayMap["4"];
        dayMap["4"] = dayMap["5"];
        dayMap["5"] = dayMap["6"];
        dayMap["6"] = dayMap["7"] + newNum;
        dayMap["7"] = dayMap["8"];
        dayMap["8"] = newNum;
        return dayMap;
    };
    const arrIter = Array.from(Array(numDays));
    if (!!isHistory === true) {
        return [currentState].concat(arrIter.reduce((f, _, i) => {
            if (i === 0) {
                f.push(calcDayArr(currentState));
            }
            else {
                f.push(calcDayArr(f[i - 1]));
            }
            return f;
        }, []));
    }
    let finalDay = currentState;
    arrIter.forEach(_ => finalDay = calcDayMap(finalDay));
    return finalDay;
}
const testAnswer = calcFishDays(testInput, true);
const testAnswerOutput = testAnswer.map((x, i, arr) => {
    const dayStrLength = arr.length.toString().length;
    const label = i === 0 ? "Initial state" : `After ${i.toString().padStart(dayStrLength)} day${i > 1 ? "s" : ""}`;
    const value = x.join(",");
    const labelValueSpacer = i === 1 ? "  " : " ";
    return `${label}:${labelValueSpacer}${value}`;
}).join("\n");
console.log(testAnswerOutput);
console.log(`Test Output Verification: ${testAnswerOutput === testExpectedStr ? "PASS" : "FAIL"}`);
const answerAForecast = calcFishDays(input, undefined, 80);
const answerA = Object.keys(answerAForecast).reduce((num, i) => answerAForecast[i] + num, 0);
console.log("Answer A: " + answerA);
const testAnswerBForecast = calcFishDays(testInput, undefined, 256);
const testAnswerB = Object.keys(testAnswerBForecast).reduce((num, i) => testAnswerBForecast[i] + num, 0);
console.log(testAnswerB);
console.log(`Test Output Verification: ${testAnswerB === 26984457539 ? "PASS" : "FAIL"}`);
const answerBForecast = calcFishDays(input, undefined, 256);
const answerB = Object.keys(answerBForecast).reduce((num, i) => answerBForecast[i] + num, 0);
console.log("Answer B: " + answerB);
//# sourceMappingURL=6.js.map