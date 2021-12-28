export const DOUBLE_NEWLINE = /\n\s?\n/;

export function getMostAndLeastCommonChar(input: string[], leastTieChar?: string, mostTieChar?: string): [string, string] {
    const charMap: {[key: string]:number} = input.reduce((map, char) => {
        if (map[char] === undefined) {
            map[char] = 0;
        }
        map[char]++;
        return map;
    }, {});

    const entries = Object.entries(charMap);
    return entries.slice(1).reduce(([least, most], curr) => {
        const [_1, currNum] = curr;
        const [_2, leastNum] = least;
        const [_3, mostNum] = most;

        if (leastNum > currNum) {
            least = curr
        } else if (leastNum === currNum) {
            least = leastTieChar ? [leastTieChar, charMap[leastTieChar]] : curr;
        }

        if (mostNum > currNum) {
            most = curr
        } else if (leastNum === currNum) {
            most = mostTieChar ? [mostTieChar, charMap[mostTieChar]] : curr;
        }

        return [least, most];
    }, [entries[0], entries[0]]).map(x => x[0]) as [string,string];
}

export function filterByColsCommon(input, isLeast) {
    const length = Math.max(...input.map(x => x.length));
    const reduced = Array.from(Array(length)).reduce((result, _, i) => {
        if (result.length === 1) {
            return result;
        }

        const cols = getCols(result);
        const [leastChar, mostChar] = getMostAndLeastCommonChar(cols[i], "0", "1");
        if (isLeast) {
            return result.filter(x => x[i] === leastChar);
        } else {
            return result.filter(x => x[i] === mostChar);
        }
    }, input);
    if (Array.isArray(reduced)) {
        return reduced;
    }
    return reduced;
}

export function reduceByColsCommon(input) {
    return getCols(input).reduce(([leastStr, mostStr], cols) => {
        const [x, y] = getMostAndLeastCommonChar(cols);
        leastStr += x;
        mostStr += y;
        return [leastStr, mostStr];
    }, ["", ""]);
}

export function joinColsToString(input: string[] | string[][]): string | string[] {
    if (Array.isArray(input[0])) {
        return input.map(x => x.join(""));
    } else {
        return input.join("");
    }
}

export function getCols(input: string[][]): string[][] {
    const length = Math.max(...input.map(x => x.length));
    return Array.from(Array(length)).map((_, i) => {
        return input.map(y => y[i]);
    });
}

export class Grid<T = string> {
    grid: T[][];
    spacer: string;

    constructor(grid: T[][], spacer = ""){
        this.grid = grid;
        this.spacer = spacer;
    }    
    
    toString() {
        return this.grid
            .map(row => row.map(point => this.pointToString(point)).join(""))
            .join("\n");
    }

    pointToString(point: T): string{
        if(typeof(point) === "string"){
            return point;
        }
        throw new Error("Not implemented");
    }

    static fromString(gridStr: string, spacer = ""){
        const rows = gridStr.split("\n");
        const grid = rows.map(x => x.trim().split(spacer));
        return new Grid<string>(grid, spacer);
    }

    static createGridString(rows: string[][], spacer = ""){
        const gridStr = rows.map(row => row.join(spacer)).join("\n");
        return gridStr;
    }
}

export type AdventCodeAnswerFunction = (input: any) => any
export type AdventCodeInputFormatter = (input: string) => any;
export type AdventCodeCustomAnswerChecker = (result: any, answer: any) => boolean;

export interface IAdventCodeDayProblemProps {
    label: string
    inputString: string
    inputFormatter: AdventCodeInputFormatter
    answer?: any
    customAnswerChecker?: AdventCodeCustomAnswerChecker
}

export interface IAdventCodeDayProblem extends IAdventCodeDayProblemProps {
    input: any
}

export class AdventCodeDayProblem implements IAdventCodeDayProblem {
    label: string
    inputString: string
    input: any
    inputFormatter: AdventCodeInputFormatter
    answer?: any
    customAnswerChecker?: AdventCodeCustomAnswerChecker

    constructor({label, inputString, answer, customAnswerChecker, inputFormatter}: IAdventCodeDayProblemProps){
        this.label = label;
        this.inputString = inputString;
        this.answer = answer;
        this.customAnswerChecker = customAnswerChecker;
        this.inputFormatter = inputFormatter;
        this.input = this.inputFormatter(this.inputString);
    }

    run(f: AdventCodeAnswerFunction){
        console.log(`Running ${this.label}...`);
        const result = f(this.input);
        const isPass = this.answer && this.customAnswerChecker ? this.customAnswerChecker(result, this.answer) : result === this.answer;
        console.log(result);
        if(this.answer){
            if(!isPass){
                console.log(`FAILED! EXPECTED: \n${this.answer}`)
            } else {
                console.log(`PASS!`)
            }
        }
    }
}

export interface IAdventCodeDayProps {
    day: number
    inputFormatter: (input: string) => any
    problemProps: Omit<IAdventCodeDayProblemProps, "inputFormatter">[];
}

export interface IAdventCodeDay extends IAdventCodeDayProps {
    problems: IAdventCodeDayProblem[]
    problemMap: {
        [key: string]: IAdventCodeDayProblem
    }
}

export type AdventCodeDayRunner = {label: string, f: AdventCodeAnswerFunction};

export class AdventCodeDay implements IAdventCodeDay {
    day: number
    inputFormatter: (input: string) => any
    problemProps: Omit<IAdventCodeDayProblemProps, "inputFormatter">[];
    problems: AdventCodeDayProblem[];
    problemMap: { [key: string]: AdventCodeDayProblem; };

    constructor({day, inputFormatter, problemProps}: IAdventCodeDayProps){
        this.day = day;
        this.inputFormatter = inputFormatter;
        this.problemProps = problemProps;
        this.problems = this.problemProps.map(p => new AdventCodeDayProblem({...p, inputFormatter: this.inputFormatter}));
        this.problemMap = this.problems.reduce((m, p) => {
            m[p.label] = p;
            return m;
        }, {})
    }

    run(runner: AdventCodeDayRunner){
        this.problemMap[runner.label]?.run(runner.f);
    }

    runAll(runners: AdventCodeDayRunner[]){
        console.log(`Advent of Code Day ${this.day}`);
        for(let runner of runners){
            this.problemMap[runner.label]?.run(runner.f);
        }
    }
}

export function generateAdjacentCoordinates(x, y, xBoundary?: number, yBoundary?:number, isDiagonalsIncluded = false, isNegativePlane = false){
    const diagonals = [
        [x - 1, y - 1],
        [x + 1, y - 1],
        [x + 1, y + 1],
        [x - 1, y + 1]
    ]

    const direct = [
        [x, y - 1],
        [x + 1, y],
        [x, y + 1],
        [x - 1, y]
    ]

    const adjacent = isDiagonalsIncluded ?  [...diagonals, ...direct] : direct;

    return adjacent.filter(([aX, aY]) => (isNegativePlane || aX >= 0 && aY >= 0) && 
    (xBoundary === undefined || aX < xBoundary) && (yBoundary === undefined || aY < yBoundary));
}

export type Coordinates = [number, number];

export function findCoordinatesIndex(x: number, y: number, arr: Coordinates[]){
    return arr.findIndex(([cX, cY]) => cX === x && cY === y);
}