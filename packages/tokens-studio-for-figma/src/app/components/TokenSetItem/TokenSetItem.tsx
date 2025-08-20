import React, { useCallback } from 'react';
import { useSelector } from 'react-redux';
import { CheckIcon } from '@radix-ui/react-icons';
import { useTranslation } from 'react-i18next';
import { Checkbox, ContextMenu, Tooltip, Box, Text } from '@tokens-studio/ui';
import { StyledCheckbox } from '../StyledDragger/StyledCheckbox';
import { StyledWrapper } from './StyledWrapper';
import { tokenSetStatusSelector } from '@/selectors';
import { RootState } from '@/app/store';
import { TokenSetStatus } from '@/constants/TokenSetStatus';
import IconIndeterminateAlt from '@/icons/indeterminate-alt.svg';
import { TreeItem } from '@/utils/tokenset';
import { DragGrabber } from '../StyledDragger/DragGrabber';
import { StyledDragButton } from '../StyledDragger/StyledDragButton';
import { formatCount } from '@/utils/formatCount';
import { useGenerateDocumentation } from '@/app/hooks/useGenerateDocumentation';
import ProBadge from '../ProBadge';

export type TokenSetItemProps = {
  item: TreeItem & { tokenCount?: number };
  isCollapsed?: boolean; // eslint-disable-line react/no-unused-prop-types
  isActive?: boolean;
  isChecked: boolean | 'indeterminate';
  canEdit: boolean;
  canDuplicate?: boolean;
  canDelete: boolean;
  canReorder?: boolean;
  extraBefore?: React.ReactNode;
  onClick: (item: TreeItem) => void;
  onCollapse?: (itemPath: string) => void; // eslint-disable-line react/no-unused-prop-types
  onCheck: (checked: boolean, item: TreeItem) => void;
  onRename: (set: string) => void;
  onDelete: (set: string) => void;
  onDuplicate: (set: string) => void;
  onTreatAsSource: (set: string) => void;
  onDragStart?: (event: React.PointerEvent<HTMLDivElement>, item: TreeItem) => void;
};

export function TokenSetItem({
  item,
  onClick,
  isActive = false,
  isChecked,
  onCheck,
  canEdit,
  canDuplicate = true,
  canDelete,
  canReorder = false,
  extraBefore,
  onRename,
  onDelete,
  onDuplicate,
  onTreatAsSource,
  onDragStart,
}: TokenSetItemProps) {
  const statusSelector = useCallback((state: RootState) => tokenSetStatusSelector(state, item.path), [item]);
  const tokenSetStatus = useSelector(statusSelector);
  const { t } = useTranslation(['tokens']);
  const { handleGenerateDocumentation, modals } = useGenerateDocumentation({
    initialTokenSet: item.isLeaf ? item.path : undefined,
  });

  const handleClick = useCallback(() => {
    onClick(item);
  }, [item, onClick]);

  const handleRename = useCallback(() => {
    onRename(item.path);
  }, [item.path, onRename]);

  const handleDelete = useCallback(() => {
    onDelete(item.path);
  }, [item.path, onDelete]);

  const handleDuplicate = useCallback(() => {
    onDuplicate(item.path);
  }, [item.path, onDuplicate]);

  const handleTreatAsSource = useCallback(() => {
    onTreatAsSource(item.path);
  }, [item.path, onTreatAsSource]);

  const handleCheckedChange = useCallback(() => {
    onCheck(!isChecked, item);
  }, [item, isChecked, onCheck]);

  const handleGrabberPointerDown = useCallback<React.PointerEventHandler<HTMLDivElement>>(
    (event) => {
      if (onDragStart) onDragStart(event, item);
    },
    [item, onDragStart],
  );

  const getCheckboxTooltip = useCallback(() => {
    if (tokenSetStatus === TokenSetStatus.SOURCE) {
      return t('sets.sourceDescription') as string;
    }
    if (isChecked) {
      return t('sets.activeDescription') as string;
    }
    return t('sets.inactiveDescription') as string;
  }, [isChecked, tokenSetStatus, t]);

  const renderIcon = useCallback(
    (checked: typeof isChecked, fallbackIcon: React.ReactNode) => {
      if (tokenSetStatus === TokenSetStatus.SOURCE) {
        return <IconIndeterminateAlt />;
      }
      return fallbackIcon;
    },
    [tokenSetStatus],
  );

  return (
    <>
      <StyledWrapper>
        <ContextMenu>
          {!item.isLeaf ? (
            <ContextMenu.Trigger asChild id={`${item.path}-trigger`}>
              <StyledDragButton
                itemType="folder"
                type="button"
                data-testid={`tokensetitem-${item.path}`}
                css={{
                  padding: '$3 $7 $3 $1',
                  paddingLeft: `${5 * item.level}px`,
                }}
                isActive={isActive}
                canReorder={canReorder}
                onClick={handleClick}
              >
                <DragGrabber item={item} canReorder={canReorder} onDragStart={handleGrabberPointerDown} />
                {extraBefore}
              </StyledDragButton>
            </ContextMenu.Trigger>
          ) : (
            <ContextMenu.Trigger asChild id={`${item.path}-trigger`}>
              <StyledDragButton
                type="button"
                css={{
                  padding: '$3 $6 $3 $1',
                  paddingLeft: `${5 * item.level}px`,
                }}
                data-testid={`tokensetitem-${item.path}`}
                isActive={isActive}
                canReorder={canReorder}
                onClick={handleClick}
              >
                <DragGrabber item={item} canReorder={canReorder} onDragStart={handleGrabberPointerDown} />
                <Box
                  css={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '$2',
                    overflow: 'hidden',
                    height: '1.5em',
                    maxWidth: 'calc(100% - $sizes$6)',
                    whiteSpace: 'nowrap',
                    textOverflow: 'ellipsis',
                    userSelect: 'none',
                  }}
                >
                  <Tooltip label={item.label} side="right">
                    <span style={{ overflow: 'hidden' }}>{item.label}</span>
                  </Tooltip>
                  {item.tokenCount !== undefined && item.tokenCount > 0 && (
                    <Text size="xsmall" muted css={{ flexShrink: 0 }}>
                      {formatCount(item.tokenCount)}
                    </Text>
                  )}
                </Box>
              </StyledDragButton>
            </ContextMenu.Trigger>
          )}
          <ContextMenu.Portal>
            <ContextMenu.Content>
              <ContextMenu.Item onSelect={handleRename} disabled={!canEdit}>
                {t('rename')}
              </ContextMenu.Item>
              {item.isLeaf && (
                <>
                  <ContextMenu.Item disabled={!canEdit || !canDuplicate} onSelect={handleDuplicate}>
                    {t('duplicate')}
                  </ContextMenu.Item>
                  <ContextMenu.Item disabled={!canEdit || !canDelete} onSelect={handleDelete}>
                    {t('delete')}
                  </ContextMenu.Item>
                  <ContextMenu.Separator />
                  <ContextMenu.Item onSelect={handleGenerateDocumentation}>
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        width: '100%',
                      }}
                    >
                      {t('generateDocumentation')}
                      <ProBadge compact campaign="tokenset-context-menu" />
                    </div>
                  </ContextMenu.Item>
                  <ContextMenu.Separator />
                  <ContextMenu.CheckboxItem
                    checked={tokenSetStatus === TokenSetStatus.SOURCE}
                    onSelect={handleTreatAsSource}
                  >
                    <ContextMenu.ItemIndicator>
                      <CheckIcon />
                    </ContextMenu.ItemIndicator>
                    {t('sets.treatAsSource')}
                  </ContextMenu.CheckboxItem>
                </>
              )}
            </ContextMenu.Content>
          </ContextMenu.Portal>
        </ContextMenu>
        <StyledCheckbox checked={isChecked}>
          {item.isLeaf ? (
            <Tooltip label={getCheckboxTooltip()} side="right">
              <Checkbox
                id={item.path}
                data-testid={`tokensetitem-${item.path}-checkbox`}
                checked={isChecked}
                renderIcon={renderIcon}
                onCheckedChange={handleCheckedChange}
              />
            </Tooltip>
          ) : (
            <Checkbox
              id={item.path}
              data-testid={`tokensetitem-${item.path}-checkbox`}
              checked={isChecked}
              renderIcon={renderIcon}
              onCheckedChange={handleCheckedChange}
            />
          )}
        </StyledCheckbox>
      </StyledWrapper>
      {modals}
    </>
  );
}
