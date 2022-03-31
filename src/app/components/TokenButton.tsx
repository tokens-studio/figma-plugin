import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { track } from '@/utils/analytics';
import { SingleToken } from '@/types/tokens';
import MoreButton from './MoreButton';
import useManageTokens from '../store/useManageTokens';
import { Dispatch, RootState } from '../store';
import useTokens from '../store/useTokens';
import BrokenReferenceIndicator from './BrokenReferenceIndicator';
import { waitForMessage } from '@/utils/waitForMessage';
import { MessageFromPluginTypes } from '@/types/messages';
import { BackgroundJobs } from '@/constants/BackgroundJobs';
import TokenTooltipWrapper from './TokenTooltipWrapper';
import { lightOrDark } from '@/utils/color';
import { getAliasValue } from '@/utils/alias';
import { TokensContext } from '@/context';
import { SelectionValue } from '@/types';
import { DocumentationProperties } from '@/constants/DocumentationProperties';
import { useGetActiveState } from '@/hooks';
import { usePropertiesForTokenType } from '../hooks/usePropertiesForType';
import { TokenTypes } from '@/constants/TokenTypes';
import { PropertyObject } from '@/types/properties';

// @TODO fix typings

function TokenButton({
  type,
  token,
  showForm,
}: {
  type: TokenTypes;
  token: SingleToken;
  showForm: Function;
}) {
  const tokensContext = React.useContext(TokensContext);
  const uiState = useSelector((state: RootState) => state.uiState);
  const activeTokenSet = useSelector((state: RootState) => state.tokenState.activeTokenSet);
  const { setNodeData } = useTokens();
  const { deleteSingleToken, duplicateSingleToken } = useManageTokens();
  const dispatch = useDispatch<Dispatch>();

  const displayValue = React.useMemo(() => 'test', []);
  // const displayValue = React.useMemo(() => (
  //   getAliasValue(token, tokensContext.resolvedTokens)
  // ), [token, tokensContext.resolvedTokens]);

  const { name } = token;
  // Only show the last part of a token in a group
  const visibleName = React.useMemo(() => {
    const visibleDepth = 1;
    return name.split('.').slice(-visibleDepth).join('.');
  }, [name]);

  const properties = usePropertiesForTokenType(type);
  // @TODO check type property typing
  const active = useGetActiveState([...properties, ...DocumentationProperties], type, name);
  const [style, showValue, buttonClass] = React.useMemo(() => {
    const style: React.CSSProperties = {};
    let showValue = true;
    const buttonClass: string[] = [];

    if (type === TokenTypes.BORDER_RADIUS) {
      style.borderRadius = `${displayValue}px`;
    } else if (type === TokenTypes.COLOR) {
      showValue = false;
      style['--backgroundColor'] = displayValue;
      style['--borderColor'] = lightOrDark(String(displayValue)) === 'light' ? '#e7e7e7' : 'white';

      buttonClass.push('button-property-color');
      if (uiState.displayType === 'LIST') {
        buttonClass.push('button-property-color-listing');
        showValue = true;
      }
    }

    if (active) {
      buttonClass.push('button-active');
    }

    return [style, showValue, buttonClass] as [typeof style, typeof showValue, typeof buttonClass];
  }, [type, active, uiState, displayValue]);

  const handleEditClick = React.useCallback(() => {
    showForm({ name, token });
  }, [name, token]);

  const handleDeleteClick = React.useCallback(() => {
    deleteSingleToken({ parent: activeTokenSet, path: name });
  }, [activeTokenSet, name]);

  const handleDuplicateClick = React.useCallback(() => {
    duplicateSingleToken({ parent: activeTokenSet, name });
  }, [activeTokenSet, name]);

  const setPluginValue = React.useCallback((value: SelectionValue) => {
    dispatch.uiState.startJob({ name: BackgroundJobs.UI_APPLYNODEVALUE });
    setNodeData(value, tokensContext.resolvedTokens);
    waitForMessage(MessageFromPluginTypes.REMOTE_COMPONENTS).then(() => {
      dispatch.uiState.completeJob(BackgroundJobs.UI_APPLYNODEVALUE);
    });
  }, [dispatch, tokensContext.resolvedTokens]);

  const onClick = React.useCallback((givenProperties: PropertyObject | PropertyObject[], isActive = active) => {
    const propsToSet = Array.isArray(givenProperties) ? givenProperties : [givenProperties];

    const tokenValue = name;
    track('Apply Token', { givenProperties });
    let value = isActive ? 'delete' : tokenValue;
    if (propsToSet[0].clear && !isActive) {
      value = 'delete';
      propsToSet[0].forcedValue = tokenValue;
    }
    const newProps = {
      [propsToSet[0].name || propsToSet[0]]: propsToSet[0].forcedValue || value,
    };
    if (propsToSet[0].clear) propsToSet[0].clear.map((item) => Object.assign(newProps, { [item]: 'delete' }));
    setPluginValue(newProps);
  }, [name, setPluginValue]);

  return (
    <div
      className={`relative mb-1 mr-1 button button-property ${buttonClass.join(' ')} ${
        uiState.disabled && 'button-disabled'
      } `}
      style={style}
    >
      <MoreButton
        properties={properties}
        documentationProperties={DocumentationProperties}
        onClick={onClick}
        onDelete={handleDeleteClick}
        onDuplicate={handleDuplicateClick}
        onEdit={handleEditClick}
        value={name}
        path={name}
      >
        <TokenTooltipWrapper token={token} resolvedTokens={tokensContext.resolvedTokens}>
          <button
            style={style}
            className="w-full h-full relativeƒ"
            type="button"
            onClick={() => onClick(properties[0])}
          >
            <BrokenReferenceIndicator token={token} resolvedTokens={tokensContext.resolvedTokens} />

            <div className="button-text">{showValue && <span>{visibleName}</span>}</div>
          </button>
        </TokenTooltipWrapper>
      </MoreButton>
    </div>
  );
}

export default TokenButton;
