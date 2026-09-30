import { ApplyVariablesStylesOrRawValues } from '@/constants/ApplyVariablesStyleOrder';
import { TokenTypes } from '@/constants/TokenTypes';
import * as borderSetter from './setBorderValuesOnTarget';
import * as colorSetter from './setColorValuesOnTarget';
import setValuesOnNode from './setValuesOnNode';
import { defaultTokenValueRetriever } from './TokenValueRetriever';

describe('setValuesOnNode async setters', () => {
  beforeEach(() => {
    defaultTokenValueRetriever.initiate({
      tokens: [{
        name: 'red', type: TokenTypes.COLOR, value: '#ff0000', rawValue: '#ff0000',
      }],
      applyVariablesStylesOrRawValue: ApplyVariablesStylesOrRawValues.RAW_VALUES,
    });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('waits for the raw fill to finish writing', async () => {
    let finishWrite: () => void = () => {};
    const writing = new Promise<void>((resolve) => {
      finishWrite = resolve;
    });
    let signalStarted: () => void = () => {};
    const started = new Promise<void>((resolve) => {
      signalStarted = resolve;
    });
    jest.spyOn(colorSetter, 'default').mockImplementationOnce(async () => {
      signalStarted();
      await writing;
    });
    const node = {
      id: '1:1',
      type: 'RECTANGLE',
      fills: [],
      fillStyleId: '',
      getSharedPluginData: () => '',
    } as unknown as RectangleNode;

    const applying = setValuesOnNode({ node, data: { fill: 'red' }, values: { fill: '#ff0000' } });
    await started;
    let completed = false;
    applying.then(() => {
      completed = true;
    });
    await Promise.resolve();
    expect(completed).toBe(false);

    finishWrite();
    await applying;
    expect(colorSetter.default).toHaveBeenCalledTimes(1);
  });

  it('waits for a composite border to finish writing', async () => {
    let finishWrite: () => void = () => {};
    const writing = new Promise<void>((resolve) => {
      finishWrite = resolve;
    });
    let signalStarted: () => void = () => {};
    const started = new Promise<void>((resolve) => {
      signalStarted = resolve;
    });
    jest.spyOn(borderSetter, 'default').mockImplementationOnce(async () => {
      signalStarted();
      await writing;
    });
    const node = { id: '1:2', type: 'RECTANGLE' } as RectangleNode;
    const border = { color: '#ff0000', width: '2', style: 'solid' };

    const applying = setValuesOnNode({ node, data: { border: 'border-token' }, values: { border } });
    await started;
    let completed = false;
    applying.then(() => {
      completed = true;
    });
    await Promise.resolve();
    expect(completed).toBe(false);

    finishWrite();
    await applying;
    expect(borderSetter.default).toHaveBeenCalledTimes(1);
  });
});
