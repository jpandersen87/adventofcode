import {AdventCodeAnswerFunction, AdventCodeCustomAnswerChecker, AdventCodeDay} from "../lib";

const testInputStr = `start-A
start-b
A-c
A-b
b-d
A-end
b-end`;

const testa2InputStr = `dc-end
HN-start
start-kj
dc-start
dc-HN
LN-dc
HN-end
kj-sa
kj-HN
kj-dc`;

const testa3InputStr = `fs-end
he-DX
fs-he
start-DX
pj-DX
end-zg
zg-sl
zg-pj
pj-he
RW-he
fs-DX
pj-RW
zg-RW
start-pj
he-WI
zg-he
pj-fs
start-RW`;

const inputStr = `cz-end
cz-WR
TD-end
TD-cz
start-UM
end-pz
kb-UM
mj-UM
cz-kb
WR-start
WR-pz
kb-WR
TD-kb
mj-kb
TD-pz
UM-pz
kb-start
pz-mj
WX-cz
sp-WR
mj-WR`;

const testAAnswer = `start,A,b,A,c,A,end
start,A,b,A,end
start,A,b,end
start,A,c,A,b,A,end
start,A,c,A,b,end
start,A,c,A,end
start,A,end
start,b,A,c,A,end
start,b,A,end
start,b,end`;

const testA2Answer = `start,HN,dc,HN,end
start,HN,dc,HN,kj,HN,end
start,HN,dc,end
start,HN,dc,kj,HN,end
start,HN,end
start,HN,kj,HN,dc,HN,end
start,HN,kj,HN,dc,end
start,HN,kj,HN,end
start,HN,kj,dc,HN,end
start,HN,kj,dc,end
start,dc,HN,end
start,dc,HN,kj,HN,end
start,dc,end
start,dc,kj,HN,end
start,kj,HN,dc,HN,end
start,kj,HN,dc,end
start,kj,HN,end
start,kj,dc,HN,end
start,kj,dc,end`;

const testBAnswer = `start,A,b,A,b,A,c,A,end
start,A,b,A,b,A,end
start,A,b,A,b,end
start,A,b,A,c,A,b,A,end
start,A,b,A,c,A,b,end
start,A,b,A,c,A,c,A,end
start,A,b,A,c,A,end
start,A,b,A,end
start,A,b,d,b,A,c,A,end
start,A,b,d,b,A,end
start,A,b,d,b,end
start,A,b,end
start,A,c,A,b,A,b,A,end
start,A,c,A,b,A,b,end
start,A,c,A,b,A,c,A,end
start,A,c,A,b,A,end
start,A,c,A,b,d,b,A,end
start,A,c,A,b,d,b,end
start,A,c,A,b,end
start,A,c,A,c,A,b,A,end
start,A,c,A,c,A,b,end
start,A,c,A,c,A,end
start,A,c,A,end
start,A,end
start,b,A,b,A,c,A,end
start,b,A,b,A,end
start,b,A,b,end
start,b,A,c,A,b,A,end
start,b,A,c,A,b,end
start,b,A,c,A,c,A,end
start,b,A,c,A,end
start,b,A,end
start,b,d,b,A,c,A,end
start,b,d,b,A,end
start,b,d,b,end
start,b,end`;

enum PATH_POINTS {
    Start = "start",
    End = "end"
}

type NetworkSegmentRaw = [string, string];
type NetworkPath = NetworkPoint[];

class NetworkPoint {
    name: string
    isBig: boolean
    isStart: boolean
    isEnd: boolean
    isDeadend: boolean
    connections: NetworkPoint[]

    constructor(name: string, connections?: NetworkPoint[]){
        this.name = name;
        this.connections = connections ?? [];
        this.isStart = name === PATH_POINTS.Start;
        this.isEnd = name === PATH_POINTS.End;
        this.isBig = !this.isStart && !this.isEnd && NetworkPoint.getIsBig(name);
        this.isDeadend = !this.isStart && !this.isEnd && this.connections.length === 1;
    };

    getConnections(isStartIncluded = false){
        if(isStartIncluded){
            return this.connections;
        }

        return this.connections.filter(c => c.name !== PATH_POINTS.Start);
    }

    addConnection(p: NetworkPoint){
        this.connections.push(p);
    }

    getConnection(p: NetworkPoint){
        return this.connections.find(np => np === p);
    }

    toString(){
        return this.name;
    }

    static getIsBig(p: string){
        return p.toLocaleLowerCase() !== p;
    }
}

class Network {
    segments: [string, string][];
    startPoint: NetworkPoint;
    endPoint: NetworkPoint;
    points: NetworkPoint[];
    paths: NetworkPath[];
    canRevisitSmall: boolean

    constructor(segments: NetworkSegmentRaw[], canRevisitSmall = false){
        this.segments = segments;
        this.canRevisitSmall = canRevisitSmall;
        const points = this.segments.reduce((a, [p1, p2]) => {
            const np1 = a.find(p => p.name === p1) ?? new NetworkPoint(p1);
            const np2 = a.find(p => p.name === p2) ?? new NetworkPoint(p2);

            if(!np1.getConnection(np2)){
                np1.addConnection(np2);
            }
            if(!np2.getConnection(np1)){
                np2.addConnection(np1);
            }

            if(!a.find(np => np === np1)){
                a.push(np1);
            }

            if(!a.find(np => np === np2)){
                a.push(np2);
            }

            return a;
        }, [] as NetworkPoint[]);
        const startPoint = points.find(p => p.name === PATH_POINTS.Start);
        const endPoint = points.find(p => p.name === PATH_POINTS.End);

        if(!startPoint || !endPoint){
            throw new Error("Missing start and/or end points");
        }

        this.startPoint = startPoint;
        this.endPoint = endPoint;
        this.points = points.filter(p => p !== this.startPoint && p !== this.endPoint);
        this.paths = this.explore(this.startPoint);
    }

    explore(point: NetworkPoint, traveled: NetworkPath = []): NetworkPath[]{
        const smallRevisited = [...traveled, point].filter((t,i,arr) => !t.isBig && !t.isStart && arr.filter(a => a === t).length > 1)
            .filter((t,i,arr) => arr.indexOf(t) === i);
        const isSmallRevisitUsed = !this.canRevisitSmall || smallRevisited.length > 0;

        if(point !== this.endPoint){
            const nextConnections = point.getConnections().filter(c => {
                const isDeadendTraversable = point.isBig || !isSmallRevisitUsed;
                const isTraveled = traveled.indexOf(c) !== -1;
                const isTraversable = (!c.isDeadend || isDeadendTraversable) && !isTraveled || (c.isBig || !isSmallRevisitUsed);

                return isTraversable;
            });

            if(nextConnections.length > 0){            
                const paths = nextConnections.map(c => this.explore(c, [...traveled, point]));
                return paths.flat(1).filter(p => p[p.length - 1] === this.endPoint);
            }
        }
        return [[...traveled, point]];
    }
}

function tA(input: NetworkSegmentRaw[]){
    const network = new Network(input);
    const paths = network.paths.map(p => p.join(","));
    return paths.join("\n");
}

function tA3(input: NetworkSegmentRaw[]){
    const network = new Network(input);
    return network.paths.length;
}

function tB(input: NetworkSegmentRaw[]){
    const network = new Network(input, true);
    const paths = network.paths.map(p => p.join(","));
    return paths.join("\n");
}

function tB3(input: NetworkSegmentRaw[]){
    const network = new Network(input, true);
    return network.paths.length;
}

function checkAnswer(result: string, answer: string){
    const resultLines = result.split("\n");
    const answerLines = answer.split("\n");
    const matches = answerLines.filter(aL => resultLines.indexOf(aL) !== -1)
    
    return resultLines.length === answerLines.length && matches.length === answerLines.length;
}

const day = new AdventCodeDay({
    day: 12,
    problemProps:[{
        label: "Test A",
        inputString: testInputStr,
        answer: testAAnswer,
        customAnswerChecker: checkAnswer,
    }, {
        label: "Test A2",
        inputString: testa2InputStr,
        answer: testA2Answer,
        customAnswerChecker: checkAnswer,
    },{
        label: "Test A3",
        inputString: testa3InputStr,
        answer: 226
    },{
        label: "Test B",
        inputString: testInputStr,
        answer: testBAnswer,
        customAnswerChecker: checkAnswer
    },{
        label: "Test B2",
        inputString: testa2InputStr,
        answer: 103
    },{
        label: "Test B3",
        inputString: testa3InputStr,
        answer: 3509
    },{
        label: "Answer B",
        inputString: inputStr
    }],
    inputFormatter: (input: string) => input.split("\n").map(x => x.split("-"))
});

day.runAll([
    {label: "Test A", f: tA}, 
    {label: "Test A2", f: tA},
    {label: "Test A3", f: tA3},
    {label: "Answer A", f: tA3},
    {label: "Test B", f: tB},
    {label: "Test B2", f: tB3},
    {label: "Test B3", f: tB3},
    {label: "Answer B", f: tB3}]);
