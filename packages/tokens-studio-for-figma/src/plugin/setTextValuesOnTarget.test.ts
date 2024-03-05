import setTextValuesOnTarget from './setTextValuesOnTarget';

describe('setTextValuesOnTarget', () => {
  let textNodeMock;
  const loadFontAsyncSpy = jest.spyOn(figma, 'loadFontAsync');

  beforeEach(() => {
    textNodeMock = {
      description: '',
      type: 'TEXT',
      fontName: {
        family: 'Inter',
        style: 'Regular',
      },
      textCase: 'NONE',
      textDecoration: 'NONE',
      fontSize: 24,
      paragraphSpacing: 0,
      paragraphIndent: 0,
      letterSpacing: 0,
      lineHeight: 'AUTO',
    };
  });

  it('sets fontSize if only fontSize is given', async () => {
    await setTextValuesOnTarget(textNodeMock, { value: { fontSize: 24 } });
    expect(textNodeMock).toEqual({ ...textNodeMock, fontSize: 24 });
  });

  it('sets fontFamily if that is given', async () => {
    await setTextValuesOnTarget(textNodeMock, { value: { fontFamily: 'Roboto' } });
    expect(textNodeMock).toEqual({ ...textNodeMock, fontName: { ...textNodeMock.fontName, family: 'Roboto' } });
  });

  it('sets fontWeight if that is given', async () => {
    await setTextValuesOnTarget(textNodeMock, { value: { fontWeight: 'Bold' } });
    expect(textNodeMock).toEqual({ ...textNodeMock, fontName: { ...textNodeMock.fontName, style: 'Bold' } });
  });

  it('sets fontFamily and fontWeight if that is given', async () => {
    loadFontAsyncSpy.mockImplementationOnce(() => (
      Promise.reject()
    ));
    loadFontAsyncSpy.mockImplementation(() => (
      Promise.resolve()
    ));
    await setTextValuesOnTarget(textNodeMock, { value: { fontFamily: 'Roboto', fontWeight: 'Bold' } });
    expect(textNodeMock).toEqual({ ...textNodeMock, fontName: { ...textNodeMock.fontName, family: 'Roboto', style: 'Bold' } });
  });

  it('converts a numerical fontWeight and sets to the node', async () => {
    loadFontAsyncSpy.mockImplementationOnce(() => (
      Promise.reject()
    ));
    loadFontAsyncSpy.mockImplementation(() => (
      Promise.resolve()
    ));
    await setTextValuesOnTarget(textNodeMock, { value: { fontWeight: '500' } });
    expect(textNodeMock).toEqual({ ...textNodeMock, fontName: { ...textNodeMock.fontName, style: 'Medium' } });
  });

  it('can\'t set number fontWeight to the node if there is no matching fontWeight', async () => {
    loadFontAsyncSpy.mockImplementation(() => (
      Promise.reject()
    ));
    await setTextValuesOnTarget(textNodeMock, { value: { fontWeight: '500' } });
    expect(textNodeMock).toEqual({ ...textNodeMock, fontName: { ...textNodeMock.fontName } });
  });

  it('sets textCase, textDecoration and description if those are given', async () => {
    await setTextValuesOnTarget(textNodeMock, {
      description: 'Use with care',
      value: { textDecoration: 'STRIKETHROUGH', textCase: 'TITLE' },
    });
    expect(textNodeMock).toEqual({
      ...textNodeMock,
      description: 'Use with care',
      textDecoration: 'STRIKETHROUGH',
      textCase: 'TITLE',
    });
  });

  it('it throws error, when there is no value in token', async () => {
    await setTextValuesOnTarget(textNodeMock, {
      description: 'Use with care',
    });
    expect(textNodeMock).toEqual({
      ...textNodeMock,
    });
  });

  it('it does nothing when the type of value is string', async () => {
    await setTextValuesOnTarget(textNodeMock, {
      description: 'Use with care',
      value: 'string',
    });
    expect(textNodeMock).toEqual({
      ...textNodeMock,
    });
  });

  it('sets paragraphIndent if that is given', async () => {
    await setTextValuesOnTarget(textNodeMock, { value: { paragraphIndent: 5 } });
    expect(textNodeMock).toEqual({ ...textNodeMock, paragraphIndent: 5 });
  });
});
