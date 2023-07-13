import { parseAbcefTokens} from "./tests/parseAndResolve";

console.log('Starting benchmark...')


// parseDefaultTokens()

// parseNestedTokens()

// parseMergeResolveTokens()

parseAbcefTokens()

console.log('All benchmarks ran...')

//Glob match all tests, throttle?
//sort the order so each run is consistent
//Import 0x - run each test in isolation.
//Remove bottom 


//Nested tokens
//reference-chains a > b > c > d > e
//reference-chains with eval math. b = a * a, c = b * b, d = c * c

//Interaction with figma DOM?!