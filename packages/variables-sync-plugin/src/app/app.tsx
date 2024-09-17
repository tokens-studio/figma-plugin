import React, { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import AppContainer from './AppContainer';


export default async () => {
  const container = document.getElementById('app');

  // Side effect from first load 

  const root = createRoot(container!);
  root.render(
    <AppContainer />
  )
  // root.render(
  //   // <Sentry.ErrorBoundary fallback={ErrorFallback}>
  //     // <Provider store={store}>
  //     //   <Tooltip.Provider>
  //         <AppContainer />
  //       {/* </Tooltip.Provider>
  //     </Provider>
  //   </Sentry.ErrorBoundary>, */}
  // );
};
