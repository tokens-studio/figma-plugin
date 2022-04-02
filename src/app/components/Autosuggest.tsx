import React, { useEffect } from 'react';
import '../styles/autosuggest.css';

interface AutosuggestProps {
  type: string;
  inputValue: string | any;
  children: React.ReactNode;
  resolvedTokens: any;
  setInputValue: Function;
  showAutoSuggest: boolean;
  setShowAutoSuggest: Function;
}

const Autosuggest: React.FunctionComponent<AutosuggestProps> = ({
  type,
  children,
  inputValue,
  setInputValue,
  resolvedTokens,
  showAutoSuggest,
  setShowAutoSuggest,
}) => {
  const [mappedValues, setMappedValues] = React.useState([]);
  const [currentFocus, setCurrentFocus] = React.useState(-1);
  const filteredValue = inputValue.replace(/[^a-zA-Z0-9.]/g, ''); // removing non-alphanumberic except . from the input value
  const focused = document.querySelector('.autosuggest-item-focused'); // get the element with this className, this is helpful for autoscroll upto focused element

  const handleKeyUp = (e: { preventDefault?: any; which?: any }) => {
    const { which } = e;

    if (which === 38 && currentFocus > 0) {
      e.preventDefault();
      setCurrentFocus(currentFocus - 1);
    }
  };

  const handleKeyDown = (e: { preventDefault?: any; which?: any }) => {
    const { which } = e;

    if (which === 40 && currentFocus < mappedValues.length - 1) {
      e.preventDefault();
      setCurrentFocus(currentFocus + 1);
    }
    if (which === 13) {
      e.preventDefault();
      setInputValue(`{${mappedValues[currentFocus].name}}`);
    }
  };

  const getHighlightedText = (text: string, highlight: string) => {
    // Split on highlight term and include term into parts, ignore case
    const parts = text.split(new RegExp(`(${highlight})`, 'gi'));
    return (
      <span>
        {parts.map((part, i) => (
          <span key={i} style={part.toLowerCase() === highlight.toLowerCase() ? { fontWeight: 'bold' } : {}}>
            {part}
          </span>
        ))}
        {' '}
      </span>
    );
  };

  useEffect(() => {
    if (inputValue.includes('}')) {
      setShowAutoSuggest(false);
      setMappedValues([]);
      return;
    }
    const filteredOnType = resolvedTokens.filter((token: any) => token?.type === type);

    if (filteredValue && inputValue.includes('{')) {
      const filteredTokens = filteredOnType.filter((token: any) => `${token?.internal__Parent}.${token?.name}`.includes(filteredValue));
      setMappedValues(filteredTokens);
      setShowAutoSuggest(filteredTokens?.length > 0);
    } else if (showAutoSuggest || inputValue === '{') {
      setMappedValues(filteredOnType);
      setShowAutoSuggest(true);
    } else {
      setShowAutoSuggest(false);
      setMappedValues([]);
    }
  }, [inputValue, showAutoSuggest]);

  useEffect(() => {
    if (focused) focused.scrollIntoViewIfNeeded(true);
  }, [focused]);

  return (
    <div className="relative autosuggest" onKeyUp={handleKeyUp} onKeyDown={handleKeyDown}>
      {children}
      {mappedValues && mappedValues.length > 0 && (
        <div className="absolute w-full overflow-y-scroll cursor-pointer z-10 dropdown">
          {mappedValues.map((token: any, index: number) => (
            <div
              key={index}
              onClick={() => setInputValue(`{${token.name}}`)}
              className={`item flex items-center ${currentFocus === index ? 'autosuggest-item-focused' : ''}`}
            >
              {type === 'color' && (
              <div className="item-color-div">
                <div className="item-color" style={{ backgroundColor: token.value }} />
              </div>
              )}
              <div className="item-name">
                {getHighlightedText(`${token.internal__Parent}.${token.name}`, filteredValue)}
              </div>
              <div className="item-value text-right uppercase">{token.value}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Autosuggest;
