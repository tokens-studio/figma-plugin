import {parseDefaultTokens, parseNestedTokens, parseMergeResolveTokens} from "./tests/parseAndResolve";

console.log('Starting benchmark...')


parseDefaultTokens()

parseNestedTokens()

parseMergeResolveTokens()

console.log('All benchmarks ran...')