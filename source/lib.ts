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

export type CoordinatesValue = [number, number, any?];
export type CoordinatesValueRange = [CoordinatesValue, CoordinatesValue]
export enum CoordinateAxis {
    X = "x",
    Y = "y"
}

export interface CoordinateGridHistoryRecord {
    history: CoordinateGridHistoryRecord[]
    points: CoordinatesValue[]
    xMax: number
    yMax: number
}

export class CoordinateGrid {
    points: CoordinatesValue[]
    history: CoordinateGridHistoryRecord[]
    spacer: string
    xMax: number
    yMax: number
    defaultValue: string
    defaultEmptyValue: string
    isNegativePlane: boolean

    constructor(coordinates: CoordinatesValue[], spacer = "", xMax?: number, yMax?: number, defaultValue = "#", defaultEmptyValue = ".", isNegativePlane = false, history?: CoordinateGridHistoryRecord[]){
        this.points = coordinates;
        this.spacer = spacer;
        this.xMax = xMax ?? this.getMax(CoordinateAxis.X);
        this.yMax = yMax ?? this.getMax(CoordinateAxis.Y);
        this.defaultValue = defaultValue;
        this.defaultEmptyValue = defaultEmptyValue;
        this.isNegativePlane = isNegativePlane;
        this.history = [];
        this.saveState();
    }

    getMax(axis:CoordinateAxis){
        const i = axis === CoordinateAxis.X ? 0 : 1;
        return this.points.reduce((p, c) => c[i] > p ? c[i] : p, 0);
    }

    saveState(){
        this.history.push({
            points: this.points,
            history: this.history,
            xMax: this.xMax,
            yMax: this.yMax
        });
    }
    
    getHistory(historyI = this.history.length - 1): any{
        return this.history[historyI];
    }

    getGridInHistory(historyI?: number){
        if(historyI !== undefined){
            const {points, xMax, yMax, history} = this.getHistory(historyI);
            return new CoordinateGrid(points, this.spacer, xMax, yMax, this.defaultValue, this.defaultEmptyValue, this.isNegativePlane, history);
        }

        return this;
    }
    
    toVisualString() {
        const lines: string[][] = [];

        for(let yI = 0; yI < this.yMax + 1; yI++){
            const line: string[] = [];
            for(let xI = 0; xI < this.xMax + 1; xI++){
                const match = this.getUniquePoints(xI, yI);
                if(match){
                    line.push(this.getPointValue(match) ?? this.defaultValue)
                } else {
                    line.push(".");
                }
            }
            lines.push(line);
        }

        return lines.map(l => l.join("")).join("\n");
    }

    getPointValue(point: CoordinatesValue){
        return point[2];
    }
    
    calcAdjacentCoordinates(x, y, isDiagonalsIncluded = false){
        const xBoundary = this.xMax, yBoundary = this.yMax
        return generateAdjacentCoordinates(x, y, xBoundary, yBoundary, isDiagonalsIncluded, this.isNegativePlane)
    }

    getAdjacentPoints(x, y, isDiagonalsIncluded = false){
        const possible = this.calcAdjacentCoordinates(x, y, isDiagonalsIncluded);
        return this.points.filter(c => possible.find(p => CoordinateGrid.getIsCoordinatesPairEqual(c,p)));
    }

    foldAxis(axis: CoordinateAxis, f: number){
        const i = axis === CoordinateAxis.X ? 0 : 1;
        this.points = this.points.map(c => {
            if(c[i] > f){
                const newCoordinate = Math.abs(c[i] - (f * 2));
                if(axis === CoordinateAxis.X){
                    return [newCoordinate, c[1], c[2]]
                }
                return [c[0], newCoordinate, c[2]];
            }
            return c;
        });
        if(axis === CoordinateAxis.X){
            this.xMax = this.xMax - (f + 1);
        } else {
            this.yMax = this.yMax - (f + 1);
        }
        this.saveState();
    }

    getPoints(x?: number, y?: number, value?: any){
        if(x !== undefined || y !== undefined || value !== undefined){
            return this.points.filter(([cX,cY,cV]) => {
                const isX = x !== undefined ? cX === x : true;
                const isY = y !== undefined ? cY === y : true;
                const isV = value ? cV === value : true;

                return isX && isY && isV;
            });
        }
        return this.points;
    }

    getPoint(x: number, y:number, value?: any){
        return this.getPoints(x,y,value)[0];
    }

    getUniquePoints(x: number, y: number): CoordinatesValue | undefined
    getUniquePoints(x?: number, y?: number): CoordinatesValue[]
    getUniquePoints(x?: number, y?: number): unknown {
        const matches = this.getPoints(x,y).filter((c,i,arr) => arr.findIndex(a => CoordinateGrid.getIsCoordinatesPairEqual(c,a)) === i);
        if(x !== undefined && y !== undefined){
            return matches[0];
        }
        return matches;
    }

    getOverlapPoints(x?: number, y?: number){
        return this.getPoints(x, y).filter((c, i, arr) => arr.findIndex((a,aI) => aI !== i && CoordinateGrid.getIsCoordinatesPairEqual(c,a)))
    }

    static getIsCoordinatesPairEqual(a: CoordinatesValue, b: CoordinatesValue, isValue = true){
        return a[0] === b[0] && a[1] === b[1] && (!isValue || a[2] === b[2]);
    }

    removePoint(point: CoordinatesValue, isSave = true){
        const removeI = this.points.findIndex(a => CoordinateGrid.getIsCoordinatesPairEqual(point, a));
        this.points = this.points.filter((_,i) => i !== removeI);
        if(isSave){
            this.saveState();
        }
    }

    addPoint(point: CoordinatesValue, isSave = true){
        this.points.push(point);
        if(isSave){
            this.saveState();
        }
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

export function generateAdjacentCoordinates(x, y, xBoundary?: number, yBoundary?:number, isDiagonalsIncluded = false, isNegativePlane = false): Coordinates[]{
    const diagonals: Coordinates[] = [
        [x - 1, y - 1],
        [x + 1, y - 1],
        [x + 1, y + 1],
        [x - 1, y + 1]
    ]

    const direct: Coordinates[] = [
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

export function attachFunction(f: Function, target: Function){
    return (...params) => target(f(...params));
}