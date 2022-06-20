describe('DownShiftInput', () => {
  it('filteredValue should only replace {} or $ and remain all letters', () => {
    const dataStore = [
      {
        input: '{opacity.10}',
        output: 'opacity.10',
      },
      {
        input: '{トランスペアレント.10',
        output: 'トランスペアレント.10',
      },
      {
        input: '$不透 明度.10',
        output: '不透 明度.10',
      },
      {
        input: '$불투명.10',
        output: '불투명.10',
      },
      {
        input: '{अस्पष्टता.10}',
        output: 'अस्पष्टता.10',
      },
      {
        input: 'թափանցիկ.10',
        output: 'թափանցիկ.10',
      },
    ];
    dataStore.forEach((data) => {
      expect(data.input.replace(/[{}$]/g, '')).toBe(data.output);
    });
  });
});
