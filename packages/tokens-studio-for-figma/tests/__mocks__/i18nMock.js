jest.mock('react-i18next', () => ({
    // this mock makes sure any components using the translate hook can use it without a warning being shown
    useTranslation: () => {
      return {
        t: (str) => str,
        i18n: {
          changeLanguage: () => new Promise(() => {}),
        },
      };
    },
    // Renders the key, then each component slot (links, bold text) empty, so tests can still find them.
    Trans: ({ i18nKey, components }) => {
      const React = jest.requireActual('react');
      return React.createElement(
        React.Fragment,
        null,
        i18nKey,
        ...Object.entries(components || {}).map(([name, component]) => React.cloneElement(component, { key: name })),
      );
    },
    initReactI18next: {
      type: '3rdParty',
      init: () => {},
    }
  }));