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