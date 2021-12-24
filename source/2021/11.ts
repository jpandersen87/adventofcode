import {AdventCodeDay, generateAdjacentCoordinates, findCoordinatesIndex} from "../lib"
import type {Coordinates} from "../lib";

const testInputStr = `5483143223
2745854711
5264556173
6141336146
6357385478
4167524645
2176841721
6882881134
4846848554
5283751526`;

const inputStr = `2524255331
1135625881
2838353863
1662312365
6847835825
2185684367
6874212831
5387247811
2255482875
8528557131`;

function flash(area: number[][], x, y, chain: Coordinates[]){
    chain.push([x,y]);
    generateAdjacentCoordinates(x, y, area[0].length, area.length, true).forEach(([aX, aY]) => {
        area[aY][aX] += 1;
        if(area[aY][aX] > 9 && findCoordinatesIndex(aX, aY, chain) === -1){
            flash(area, aX, aY, chain);
        }
    });

    return [area, chain];
}

function step(area: number[][]){
    let flashedPositions: Coordinates[] = [];
    let newArea = area.map(row => row.map(val => val + 1));
    newArea.forEach((row, y, rows) =>
        row.forEach((val, x) => {
            if(val > 9 && findCoordinatesIndex(x, y, flashedPositions) === -1){
                flash(rows, x, y, flashedPositions);
            }
        }));
    newArea = newArea.map(row => row.map(val => val > 9 ? 0 : val));
    return [newArea, flashedPositions];
}

function a(area: number[][]){
    let rArea = area, flashCount = 0;

    for(let i = 0; i < 100; i++){
        const result = step(rArea);
        rArea = result[0];
        const stepFlashCount = result[1].length;
        flashCount += stepFlashCount;
    }

    return flashCount;
}

function b(area: number[][]){
    let rArea = area, flashCount = 0, i = 0;
    const count = rArea.length * rArea[0].length;

    while(true){
        const result = step(rArea);
        rArea = result[0];
        const stepFlashCount = result[1].length;
        flashCount += stepFlashCount;
        if(stepFlashCount === count){
            return i + 1;
        }
        i++;
    }
}

const day = new AdventCodeDay({
    inputFormatter: inputStr => inputStr.split("\n").map(row => row.split("").map(val => parseInt(val))),
    answerInputString: inputStr,
    day: 11,
    testAInputString: testInputStr,
    testAAnswer: 1656,
    testBAnswer: 195
});

day.run(a, a, b, b);