import { findMatchingReferences, findReferences, replaceReferences } from './findReferences';

describe('findReferences', () => {
  it('returns references in a string', () => {
    expect(findReferences('$colors.blue')).toEqual(['colors.blue']);
    expect(findReferences('{colors.blue}')).toEqual(['colors.blue']);
    expect(findReferences('rgba({colors.blue})')).toEqual(['colors.blue']);
    expect(findReferences('{colors.blue} * 2')).toEqual(['colors.blue']);
    expect(findReferences('{colors.blue} * {colors.red}')).toEqual(['colors.blue', 'colors.red']);
    expect(findReferences('{colors.the one with spacing} * {colors.red}')).toEqual([
      'colors.the one with spacing',
      'colors.red',
    ]);
  });
});

describe('findMatchingReferences', () => {
  it('returns references in a string that match token name', () => {
    expect(findMatchingReferences('$colors.blue', 'colors.blue')).toEqual(['colors.blue']);
    expect(findMatchingReferences('{colors.blue}', 'colors.blue')).toEqual(['colors.blue']);
    expect(findMatchingReferences('rgba({colors.blue})', 'colors.blue')).toEqual(['colors.blue']);
    expect(findMatchingReferences('{colors.blue} * 2', 'colors.blue')).toEqual(['colors.blue']);
    expect(findMatchingReferences('{colors.blue} * {colors.red}', 'colors.blue')).toEqual(['colors.blue']);
  });

  it('returns empty if it doesnt match', () => {
    expect(findMatchingReferences('$colors.blue', 'colors.red')).toEqual([]);
    expect(findMatchingReferences('{colors.blue}', 'colors.red')).toEqual([]);
    expect(findMatchingReferences('rgba({colors.blue})', 'colors.red')).toEqual([]);
    expect(findMatchingReferences('{colors.blue} * 2', 'colors.red')).toEqual([]);
    expect(findMatchingReferences('{colors.blue} * {colors.red}', 'colors.yellow')).toEqual([]);
  });
});

describe('replaceReferences', () => {
  it('replaces references with new name', () => {
    expect(replaceReferences('{colors.blue}', 'colors.blue', 'colors.yellow')).toEqual('{colors.yellow}');
    expect(replaceReferences('rgba({colors.blue})', 'colors.blue', 'colors.yellow')).toEqual(
      'rgba({colors.yellow})',
    );
    expect(replaceReferences('{colors.blue} * 2', 'colors.blue', 'colors.yellow')).toEqual('{colors.yellow} * 2');
    expect(replaceReferences('{colors.blue} * {colors.red}', 'colors.blue', 'colors.yellow')).toEqual(
      '{colors.yellow} * {colors.red}',
    );
  });

  it('replaces references with new name and changes alias syntax', () => {
    expect(replaceReferences('$colors.blue', 'colors.blue', 'colors.yellow')).toEqual('$colors.yellow');
  });

  it('doesnt replace anything if it doesnt match empty if it doesnt match', () => {
    expect(replaceReferences('$colors.blue', 'colors.other', 'colors.yellow')).toEqual('$colors.blue');
    expect(replaceReferences('{colors.blue}', 'colors.other', 'colors.yellow')).toEqual('{colors.blue}');
    expect(replaceReferences('rgba({colors.blue})', 'colors.other', 'colors.yellow')).toEqual(
      'rgba({colors.blue})',
    );
    expect(replaceReferences('{colors.blue} * 2', 'colors.other', 'colors.yellow')).toEqual('{colors.blue} * 2');
    expect(replaceReferences('{colors.blue} * {colors.red}', 'colors.other', 'colors.yellow')).toEqual(
      '{colors.blue} * {colors.red}',
    );
  });
});
