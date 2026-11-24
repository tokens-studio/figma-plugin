import { renameVariableTokens } from './renameVariableTokens';

const color = (name: string, value: string, id?: string) => ({
  name, value, type: 'color', ...(id ? { $extensions: { id } } : {}),
});
const rename = (set: string) => ({ set, oldName: 'accent', newName: 'primary' });

describe('renameVariableTokens', () => {
  it('renames the token and the references to it, in every kind of value', () => {
    const { tokens, updatedReferences } = renameVariableTokens({
      'Color/Light': [color('accent', '#111', 'token-accent')],
      other: [
        color('link', '{accent}'),
        color('hover', '{accent.hover}'),
        { name: 'size', value: 4, type: 'number' },
        { name: 'shadow', value: [{ color: '{accent}', x: '0' }], type: 'boxShadow' },
        {
          name: 'faded',
          value: '#000',
          type: 'color',
          $extensions: {
            'studio.tokens': {
              modify: {
                type: 'mix', value: '0.5', color: '{accent}', space: 'lch',
              },
            },
          },
        },
      ],
    } as any, [rename('Color/Light')]);

    expect(tokens['Color/Light']).toEqual([color('primary', '#111', 'token-accent')]);
    expect(tokens.other.slice(0, 4)).toEqual([
      color('link', '{primary}'),
      color('hover', '{accent.hover}'),
      { name: 'size', value: 4, type: 'number' },
      { name: 'shadow', value: [{ color: '{primary}', x: '0' }], type: 'boxShadow' },
    ]);
    expect((tokens.other[4].$extensions as any)['studio.tokens'].modify.color).toBe('{primary}');
    expect(updatedReferences.map(({ set, name }) => `${set}:${name}`)).toEqual(['other:link', 'other:shadow']);
  });

  it('keeps references while another set still has a token with the old name', () => {
    const previous = {
      'Color/Light': [color('accent', '#111')], brand: [color('accent', '#999')], other: [color('link', '{accent}')],
    } as any;
    const { tokens, updatedReferences } = renameVariableTokens(previous, [rename('Color/Light')]);

    expect(tokens.brand).toBe(previous.brand);
    expect(tokens.other).toBe(previous.other);
    expect(updatedReferences).toEqual([]);
  });

  it('lists a renamed token whose own reference changed under its old name', () => {
    const { tokens, updatedReferences } = renameVariableTokens({
      'Color/Light': [color('accent', '#111'), color('hover', '{accent}')],
    } as any, [rename('Color/Light'), { set: 'Color/Light', oldName: 'hover', newName: 'active' }]);

    expect(tokens['Color/Light']).toEqual([color('primary', '#111'), color('active', '{primary}')]);
    expect(updatedReferences).toEqual([{ set: 'Color/Light', name: 'hover', value: '{primary}' }]);
  });

  it('does nothing when the token is missing or the new name is taken', () => {
    const previous = { 'Color/Light': [color('accent', '#111'), color('primary', '#222')] } as any;

    expect(renameVariableTokens(previous, [rename('Color/Light'), rename('Color/Dark')])).toEqual({ tokens: previous, updatedReferences: [] });
  });
});
