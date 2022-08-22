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

  it('convert number fontWeight and sets to the node', async () => {
    loadFontAsyncSpy.mockImplementationOnce(() => (
      Promise.reject()
    ));
    loadFontAsyncSpy.mockImplementation(() => (
      Promise.resolve()
    ));
    await setTextValuesOnTarget(textNodeMock, { value: { fontWeight: '500' } });
    expect(textNodeMock).toEqual({ ...textNodeMock, fontName: { ...textNodeMock.fontName, style: 'Medium' } });
  });

  it(`can't set number fontWeight to the node if there is no match fontWeight`, async () => {
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
});
