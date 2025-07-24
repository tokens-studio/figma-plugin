import {
  useCallback, useEffect, useState,
} from 'react';

export const getHashParams = () => {
  const params = new URLSearchParams(window.location.hash.slice(1));
  const tab = params.get('tab') || '';
  const [action, subAction] = params.get('action')?.split('.') || [];
  const theme = params.get('theme') || 'system';
  const fullscreen = Boolean(params.get('fullscreen'));

  return {
    tab,
    action,
    subAction,
    theme,
    fullscreen,
  };
};

type State = {
  tab: string,
  action: string,
  subAction: string,
  theme: string,
  fullscreen: boolean,
};

export function usePreviewState() {
  const [data, setData] = useState<State>(getHashParams());

  useEffect(() => {
    const updateStateFromHash = () => {
      const hashParams = getHashParams();
      const statePatch = Object.keys(data).reduce((acc, id) => {
        if (data[id] !== hashParams[id]) {
          acc[id] = hashParams[id];
        }
        return acc;
      }, {});

      if (Object.keys(statePatch).length > 0) {
        setData((state) => ({ ...state, ...statePatch }));
      }
    };

    window.addEventListener('hashchange', updateStateFromHash);

    return () => window.removeEventListener('hashchange', updateStateFromHash);
  }, [data]);
  const updateHash = useCallback((hashData) => {
    const urlParams = new URLSearchParams(window.location.hash.slice(1));
    Object.keys(hashData).forEach((k) => {
      let value = hashData[k];
      if (k === 'fullscreen') {
        value = hashData[k] ? 'true' : '';
      }
      urlParams.set(k, value);
    });
    window.location.hash = `#${urlParams.toString()}`;
  }, []);

  return { data, updateHash };
}
