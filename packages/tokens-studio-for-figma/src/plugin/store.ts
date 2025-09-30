type State = {
  inspectDeep: boolean;
  shouldSendSelectionValues: boolean;
  autoApplyThemeOnDrop: boolean;
};

const store: State = {
  inspectDeep: false,
  shouldSendSelectionValues: false,
  autoApplyThemeOnDrop: false,
};

export default store;
