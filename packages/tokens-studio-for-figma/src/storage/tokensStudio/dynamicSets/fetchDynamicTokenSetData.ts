import { GeneratorQuery, Graphql, RawToken } from '@tokens-studio/sdk';
import { GET_GENERATOR_QUERY } from '../graphql';
import { FlowGraph, execute, minimizeFlowGraph, nodes } from '@tokens-studio/graph-engine';
import { externalLoader } from './externalLoader';

export const fetchDynamicTokenSetData = async (generatorUrn: string) => {
  try {
    const responseData = await Graphql.exec<GeneratorQuery>(
      Graphql.op(GET_GENERATOR_QUERY, {
        urn: generatorUrn,
      }),
    );

    if (!responseData.data?.generator?.graph) {
      return null;
    }

    const graph = JSON.parse(responseData.data.generator.graph) as FlowGraph;

    const output = (await execute({
      graph: minimizeFlowGraph(graph),
      inputValues: {},
      nodes,
      externalLoader,
    })) as { tokens: Array<RawToken> };

    const tokensArray = Object.values(output).reduce((acc, curr) => {
      if (Array.isArray(curr)) {
        return [...acc, ...curr];
      }
      return acc;
    }, []);

    return tokensArray;
  } catch (error) {
    console.error(error);
  }

  return null;
};
