import React from 'react';
import { styled } from '@/stitches.config';
import Box from './Box';
import Checkbox from './Checkbox';
import IconChevronDown from './icons/IconChevronDown';
import { getTree } from './utils/getTree';

type TreeItem = {
  path: string;
  parent: string;
  type: 'folder' | 'set';
  level: number
};

const ChevronButton = styled('button', {
  padding: 2,
});

export default function TokenSetTree({ tokenSets }: { tokenSets: string[] }) {
  console.log('Token sets', tokenSets);
  const [items, setItems] = React.useState<TreeItem[]>([]);
  const [collapsed, setCollapsed] = React.useState<string[]>([]);

  React.useEffect(() => {
    setItems(getTree(tokenSets));
  }, [tokenSets]);

  function toggleCollapsed(set) {
    setCollapsed(collapsed.includes(set) ? collapsed.filter((s) => s !== set) : [...collapsed, set]);
  }

  return (
    <Box>
      {items.map((item) => (collapsed.some((i) => item.parent.startsWith(i)) ? null
        : (
          <Box key={item.path} css={{ padding: '$1' }}>
            <Box css={{
              display: 'flex', alignItems: 'center', gap: '$1', fontSize: '$small', paddingLeft: `${3 * item.level}px`,
            }}
            >
              <ChevronButton onClick={() => toggleCollapsed(item.path)} type="button">{item.type === 'folder' ? <IconChevronDown /> : null}</ChevronButton>
              <Checkbox
                size="small"
                checked={false}
                id={item.path}
                onCheckedChange={() => {}}
              />
              <button>{item.path}
            </Box>
          </Box>
        )))}
    </Box>
  );
}
