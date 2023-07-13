import transform from '../../src/utils/transform'

// import {default as nest_2} from '../mocks/nest_2.json'
// import {default as nest_5} from '../mocks/nest_5.json'
// import {default as nest_10} from '../mocks/nest_10.json'
// import {default as nest_20} from '../mocks/nest_20.json'
// import {default as nest_50} from '../mocks/nest_50.json'
// import {default as nest_100} from '../mocks/nest_100.json'
// import {default as nest_500} from '../mocks/nest_500.json'

// import {default as tokens} from '../mocks/tokens.json'

// import abcdef from '../mocks/abcdefmock10.json'

// export const parseDefaultTokens = () => {
//     const parsedTokens = parseTokenValues(testTokens);
// }    

// export const parseNestedTokens = () => {
//     const parsed_2 = parseTokenValues(nest_2)
//     const parsed_5 = parseTokenValues(nest_5)
//     const parsed_10 = parseTokenValues(nest_10)
//     const parsed_20 = parseTokenValues(nest_20)
//     const parsed_50 = parseTokenValues(nest_50)
//     const parsed_100 = parseTokenValues(nest_100)
//     const parsed_500 = parseTokenValues(nest_500)
// }


// export const parseMergeResolveTokens = () => {
//     const parsedTokens = parseTokenValues(tokens)
//     const merged = mergeTokenGroups(parsedTokens, ['Foundations', 'Light', 'Dark'])
//     const resolved = resolveTokenValues(merged)
// }

const abcdef = {
  "index_0": {
    "value": "10px",
    "type": "dimension"
  },
  "index_1": {
    "value": "{index_0} * {index_0}",
    "type": "dimension"
  },
  "index_2": {
    "value": "{index_1} * {index_1}",
    "type": "dimension"
  },
  "index_3": {
    "value": "{index_2} * {index_2}",
    "type": "dimension"
  },
  "index_4": {
    "value": "{index_3} * {index_3}",
    "type": "dimension"
  },
  "index_5": {
    "value": "{index_4} * {index_4}",
    "type": "dimension"
  },
  "index_6": {
    "value": "{index_5} * {index_5}",
    "type": "dimension"
  },
  "index_7": {
    "value": "{index_6} * {index_6}",
    "type": "dimension"
  },
  "index_8": {
    "value": "{index_7} * {index_7}",
    "type": "dimension"
  },
  "index_9": {
    "value": "{index_8} * {index_8}",
    "type": "dimension"
  },
  "index_10": {
    "value": "{index_9} * {index_9}",
    "type": "dimension"
  }
}

export const parseAbcefTokens = () => {
 // @ts-ignore
let reversed = Object.fromEntries(Object.entries(abcdef).reverse())
const t0 = performance.now()
// @ts-ignore
transform({core: reversed}, ['core'], [], {
  expandTypography: true,
  expandShadow: false,
  expandComposition: true,
  preserveRawValue: false,
  throwErrorWhenNotResolved: false,
  resolveReferences: true,
  expandBorder: false,
})
const t1 = performance.now()
// @ts-ignore
transform({core: abcdef}, ['core'], [], {
  expandTypography: true,
  expandShadow: false,
  expandComposition: true,
  preserveRawValue: false,
  throwErrorWhenNotResolved: false,
  resolveReferences: true,
  expandBorder: false,
})
const t2 = performance.now()
console.log('reversed', t1 - t0)
console.log('normal', t2 - t1)

}