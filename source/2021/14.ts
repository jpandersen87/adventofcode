import {AdventCodeDay} from "../lib"

const testInputStr = `NNCB

CH -> B
HH -> N
CB -> H
NH -> C
HB -> C
HC -> B
HN -> C
NN -> C
BH -> H
NC -> B
NB -> B
BN -> B
BB -> N
BC -> B
CC -> N
CN -> C`;

const inputStr = `VPPHOPVVSFSVFOCOSBKF

CO -> B
CV -> N
HV -> H
ON -> O
FS -> F
NS -> S
VK -> C
BV -> F
SC -> N
NV -> V
NC -> F
NH -> B
BO -> K
FC -> H
NB -> H
HO -> F
SB -> N
KP -> V
OS -> C
OB -> P
SH -> N
BC -> H
CK -> H
SO -> N
SP -> P
CF -> P
KV -> F
CS -> V
FF -> P
VS -> V
CP -> S
PH -> V
OP -> K
KH -> B
FB -> S
CN -> H
KS -> P
FN -> O
PV -> O
VC -> S
HF -> N
OC -> O
PK -> V
KC -> C
HK -> C
PO -> N
OO -> S
VH -> N
CC -> K
BP -> K
HC -> K
FV -> K
KF -> V
VF -> C
HN -> S
VP -> B
HH -> O
FO -> O
PC -> N
KK -> C
PN -> P
NN -> C
FH -> N
VV -> O
OK -> V
CB -> N
SN -> H
VO -> H
BB -> C
PB -> F
NF -> P
KO -> S
PP -> K
NO -> O
SF -> N
KN -> S
PS -> O
VN -> V
SS -> N
BF -> O
HP -> H
HS -> N
BS -> S
VB -> F
PF -> K
SV -> V
BH -> P
FP -> O
CH -> P
OH -> K
OF -> F
HB -> V
FK -> V
BN -> V
SK -> F
OV -> C
NP -> S
NK -> S
BK -> C
KB -> F`;

type Template = string;
type InsertionRule = [string, string];
interface TemplatePairMetadata {
    [key: string]: number
}

function step(count: number, template: Template, insertionRules: InsertionRule[]){
    const pairMap = calcPolymerPairCountMap(template);
    const countMap = calcPolymerCountMap(template);

    for(let step = 0; step < count; step++){
        const rules = insertionRules.filter(([pair]) => pairMap[pair] && pairMap[pair] > 0);
        const ruleCounts: [InsertionRule, number][] = rules.map(r => [r, pairMap[r[0]]]);

        for(let [[pair, add], count] of ruleCounts){
            const newLeft = pair[0]+add;
            const newRight = add+pair[1];
            
            pairMap[newLeft] = (pairMap[newLeft] ?? 0) + count;
            pairMap[newRight] = (pairMap[newRight] ?? 0) + count;
            countMap[add] = (countMap[add] ?? 0) + count;
            pairMap[pair] = pairMap[pair] - count;
        }
    }

    return [pairMap, countMap];
}

function calcPolymerPairCountMap(polymer: string): TemplatePairMetadata{
    return Array.from(polymer).reduce(([m, p], e, i) => {
        if(p){
            const target = p + e;
            m[target] = (m[target] ?? 0) + 1;
        }
        return [m, e];
    }, [{}, ""])[0]
}

function getMostLeast(map: {[key: string]: number}){
    return Object.values(map).reduce(([l,m], c, i) => {
        if(i > 0){
            if(c < l){
                l = c;
            }
            if(c > m){
                m = c;
            }
            return [l,m]
        }

        return [c,c]
    }, [0,0]);
}

function calcPolymerCountMap(polymer: string){
    return Array.from(polymer).reduce((m, c) => {
        m[c] = (m[c] ?? 0) + 1;
        return m;
    }, {})
}

function a([template, insertionRules]: [Template, InsertionRule[]]){
    const [pairMap, countMap] = step(10, template, insertionRules);
    const [least, most] = getMostLeast(countMap);

    return most - least;
}

function b([template, insertionRules]: [Template, InsertionRule[]]){
    const [pairMap, countMap] = step(40, template, insertionRules);
    const [least, most] = getMostLeast(countMap);

    return most - least;
}

const day = new AdventCodeDay({
    day: 14,
    inputFormatter: (input: string) => {
        const [template, insertionsString] = input.split("\n\n");
        return [template, insertionsString.split("\n").map(x => x.split(" -> "))]
    },
    problemProps: [{
        label: "Test Answer A",
        inputString: testInputStr,
        answer: 1588,
    },{
        label: "Answer A",
        inputString: inputStr
    },{
        label: "Test Answer B",
        inputString: testInputStr,
        answer: 2188189693529,
    },{
        label: "Answer B",
        inputString: inputStr
    }]
});

day.runAll([
    {label: "Test Answer A", f: a},
    {label: "Answer A", f: a},
    {label: "Test Answer B", f: b},
    {label: "Answer B", f: b}
])