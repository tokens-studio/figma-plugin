import React, {
  useCallback, useContext,
} from 'react';
import { useSelector } from 'react-redux';
import { useUIDSeed } from 'react-uid';
import { editProhibitedSelector } from '@/selectors';
import { DragControlsContext } from '@/context';
import SingleCompositionTokenForm from './SingleCompositionTokenForm';
import { NodeTokenRefMap } from '@/types/NodeTokenRefMap';
import { ResolveTokenValuesResult } from '@/plugin/tokenHelpers';
import { StyledDragButton } from './StyledDragger/StyledDragButton';
import { DragGrabber } from './StyledDragger/DragGrabber';

type Props = React.PropsWithChildren<{
  index: number;
  property: string;
  propertyValue: string;
  tokenValue: NodeTokenRefMap;
  properties: string[];
  resolvedTokens: ResolveTokenValuesResult[];
  setTokenValue: (neweTokenValue: NodeTokenRefMap) => void;
  onRemove: (property: string) => void;
  setOrderObj: (newOrderObj: NodeTokenRefMap) => void;
  setError: (newError: boolean) => void;
  onSubmit: () => void
}>;

export function SingleCompositionTokenContent({
  index,
  property,
  propertyValue,
  tokenValue,
  properties,
  resolvedTokens,
  setTokenValue,
  onRemove,
  setOrderObj,
  setError,
  onSubmit,
}: Props) {
  const dragContext = useContext(DragControlsContext);
  const editProhibited = useSelector(editProhibitedSelector);
  const seed = useUIDSeed();

  const handleDragStart = useCallback((event: React.PointerEvent<HTMLDivElement>) => {
    dragContext.controls?.start(event);
  }, [dragContext.controls]);

  return (
    <StyledDragButton
      grabberVisible
      type="button"
      style={{ cursor: 'inherit' }}
      css={{ padding: '$1 0 $1 $1' }}
    >
      <DragGrabber<string>
        item={property}
        canReorder={!editProhibited}
        onDragStart={handleDragStart}
      />
      <SingleCompositionTokenForm
        key={`single-style-${seed(index)}`}
        index={index}
        property={property}
        propertyValue={propertyValue}
        tokenValue={tokenValue}
        properties={properties}
        resolvedTokens={resolvedTokens}
        setTokenValue={setTokenValue}
        onRemove={onRemove}
        setOrderObj={setOrderObj}
        setError={setError}
        onSubmit={onSubmit}
      />
    </StyledDragButton>
  );
}
