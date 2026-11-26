import React from 'react';
import userEvent from '@testing-library/user-event';
import { render, screen } from '../../../../tests/config/setupTest';
import { SearchableMultiSelect } from './SearchableMultiSelect';

const menuItems = ['global', 'light', 'dark', 'brand/colors'];

function ControlledSearchableMultiSelect({ initialSelectedItems = [] }: { initialSelectedItems?: string[] }) {
  const [selectedItems, setSelectedItems] = React.useState<string[]>(initialSelectedItems);

  return (
    <SearchableMultiSelect
      menuItems={menuItems}
      selectedItems={selectedItems}
      handleSelectedItemChange={setSelectedItems}
    />
  );
}

async function openDropdown() {
  await userEvent.click(screen.getByTestId('searchable-multi-select-trigger'), { pointerEventsCheck: 0 });
}

describe('SearchableMultiSelect', () => {
  it('shows the name of the selected item on the trigger', () => {
    render(<ControlledSearchableMultiSelect initialSelectedItems={['global']} />);

    expect(screen.getByTestId('searchable-multi-select-trigger')).toHaveTextContent('global');
  });

  it('shows how many items are selected when there are multiple', () => {
    render(<ControlledSearchableMultiSelect initialSelectedItems={['global', 'light']} />);

    expect(screen.getByTestId('searchable-multi-select-trigger')).toHaveTextContent('multiSelect.itemsSelected');
  });

  it('lists all items when opened', async () => {
    render(<ControlledSearchableMultiSelect />);
    await openDropdown();

    expect(screen.getByTestId('searchable-multi-select-content')).toBeInTheDocument();
    menuItems.forEach((item) => {
      expect(screen.getByTestId(`searchable-multi-select-item-${item}`)).toBeInTheDocument();
    });
  });

  it('stays open while selecting multiple items', async () => {
    render(<ControlledSearchableMultiSelect />);
    await openDropdown();

    await userEvent.click(screen.getByTestId('searchable-multi-select-checkbox-global'), { pointerEventsCheck: 0 });
    expect(screen.getByTestId('searchable-multi-select-content')).toBeInTheDocument();

    await userEvent.click(screen.getByTestId('searchable-multi-select-checkbox-dark'), { pointerEventsCheck: 0 });
    expect(screen.getByTestId('searchable-multi-select-content')).toBeInTheDocument();

    expect(screen.getByTestId('searchable-multi-select-checkbox-global')).toHaveAttribute('data-state', 'checked');
    expect(screen.getByTestId('searchable-multi-select-checkbox-dark')).toHaveAttribute('data-state', 'checked');
  });

  it('deselects an item that was selected before', async () => {
    render(<ControlledSearchableMultiSelect initialSelectedItems={['global']} />);
    await openDropdown();

    await userEvent.click(screen.getByTestId('searchable-multi-select-checkbox-global'), { pointerEventsCheck: 0 });

    expect(screen.getByTestId('searchable-multi-select-checkbox-global')).toHaveAttribute('data-state', 'unchecked');
  });

  it('filters the items by the search term', async () => {
    render(<ControlledSearchableMultiSelect />);
    await openDropdown();

    await userEvent.type(screen.getByTestId('searchable-multi-select-search'), 'DAR');

    expect(screen.getByTestId('searchable-multi-select-item-dark')).toBeInTheDocument();
    expect(screen.queryByTestId('searchable-multi-select-item-global')).not.toBeInTheDocument();
  });

  it('shows a message when nothing matches the search term', async () => {
    render(<ControlledSearchableMultiSelect />);
    await openDropdown();

    await userEvent.type(screen.getByTestId('searchable-multi-select-search'), 'nonexistent');

    expect(screen.getByTestId('searchable-multi-select-no-results')).toBeInTheDocument();
  });

  it('selects and deselects every item at once', async () => {
    render(<ControlledSearchableMultiSelect />);
    await openDropdown();

    await userEvent.click(screen.getByTestId('searchable-multi-select-toggle-all'), { pointerEventsCheck: 0 });
    menuItems.forEach((item) => {
      expect(screen.getByTestId(`searchable-multi-select-checkbox-${item}`)).toHaveAttribute('data-state', 'checked');
    });

    await userEvent.click(screen.getByTestId('searchable-multi-select-toggle-all'), { pointerEventsCheck: 0 });
    menuItems.forEach((item) => {
      expect(screen.getByTestId(`searchable-multi-select-checkbox-${item}`)).toHaveAttribute('data-state', 'unchecked');
    });
  });

  it('only selects the items that match the search term when toggling all', async () => {
    render(<ControlledSearchableMultiSelect />);
    await openDropdown();

    await userEvent.type(screen.getByTestId('searchable-multi-select-search'), 'dar');
    await userEvent.click(screen.getByTestId('searchable-multi-select-toggle-all'), { pointerEventsCheck: 0 });
    await userEvent.clear(screen.getByTestId('searchable-multi-select-search'));

    expect(screen.getByTestId('searchable-multi-select-checkbox-dark')).toHaveAttribute('data-state', 'checked');
    expect(screen.getByTestId('searchable-multi-select-checkbox-global')).toHaveAttribute('data-state', 'unchecked');
  });

  it('resets the search term when the dropdown is closed and reopened', async () => {
    render(<ControlledSearchableMultiSelect />);
    await openDropdown();

    await userEvent.type(screen.getByTestId('searchable-multi-select-search'), 'dark');
    await userEvent.keyboard('{Escape}');
    await openDropdown();

    expect(screen.getByTestId('searchable-multi-select-search')).toHaveValue('');
    expect(screen.getByTestId('searchable-multi-select-item-global')).toBeInTheDocument();
  });
});
