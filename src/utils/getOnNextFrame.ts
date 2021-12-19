import {runOnNextFrame} from './runOnNextFrame';

export async function getOnNextFrame<V>(fn: () => Promise<V>): Promise<V | null> {
    let value: V | null = null;
    await runOnNextFrame(async () => {
        value = await fn();
    });
    return value;
}
