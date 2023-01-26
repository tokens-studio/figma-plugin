export default {
  width: '100%',
  input: {
    width: '100%',
    height: '28px',
    padding: '0 var(--space-3)',
    backgroundColor: 'var(--colors-bgDefault)',
    border: '1px solid var(--colors-borderMuted)',
    borderRadius: 'var(--radii-input)',
    fontSize: 'var(--fontSizes-small)',
  },
  suggestions: {
    borderRadius: 'var(--radii-contextMenu)',
    boxShadow: 'var(--shadows-contextMenu)',
    background: 'var(--colors-bgDefault)',
    list: {
      top: 'var(--space-3)',
      fontSize: 'var(--fontSizes-small)',
      borderRadius: 'var(--radii-contextMenu)',
      cursor: 'pointer',
      zIndex: '10',
    },
    item: {
      display: 'flex',
      alignItems: 'center',
      gap: 'var(--space-2)',
      padding: 'var(--space-3) var(--space-3)',
      color: 'var(--colors-fgDefault)',
      fontSize: 'var(--fontSizes-xsmall)',
      '&focused': {
        background: 'var(--colors-interaction)',
      },
    },
  },
};
