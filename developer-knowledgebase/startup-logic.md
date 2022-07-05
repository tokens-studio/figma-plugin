## Current situation

It is important to understand the startup process of the plugin. At the time of writing this logic is a little scattered and can/should be optimized. (which is the situation we would want to be in)

However, for everyone's understanding the current logic is as follows:

| Filename | Line(s) | Steps taken | Crucial step? |
| -------- | ------- | ----------- | -- |
| `plugin/controller.ts` | | This is the main entrypoint of the plugin. | |
|  | `13-17` | Here we are just launching the UI. The plugin is mostly UI driven, meaning the commands are regulated by the React app more primarily as opposed to the plugin code. | ✅ |
| | `...` | The remaining lines simply set-up the handlers for any commands coming from the UI, as well as some event handlers for the plugin itself | ✅ |
| `app/store.ts` | `...` | This is the redux store file. The store will be created on load with a default state. | ✅ |
| `app/index.tsx` | | This is the main UI entrypoint of the plugin. | |
| | `19` | Here we initialize the [Mixpanel](https://mixpanel.com/) analytics. | ❌ |
| | `21-27` | Here we initialize [Sentry](https://docs.sentry.io/) error tracking | ❌ |
| | `41-50` | Here we bootstrap and render our actual `App` | ✅ |
| `app/components/Initiator.tsx` |  |This file handles the initialization of the React app. | ✅ |
| | `55` | This effect is run on mount and triggers the plugin initialization. | ✅ |
|| `256-268` | This effect is run whenever the license changes and runs the license verification. This step is crucial for the plugin because it enables/disables certain features. | ✅ |
| `plugin/asyncMessageHandlers/initiate.ts` | | This is the code which handles the plugin side initialization, triggered by the `INITIATE` message. | ✅ |
| | `18-24` | Here we fetch the saved settings and inform the UI of them. | ✅ |
| | `34` | Here we read the license key and inform the UI. | ✅ |
| `app/components/Initiator.tsx` | | | |
| | `240...247` | Once the UI receives the license key, the Redux state will be updated with it | ✅ |
| | `256-268` | Becauses the license kay may have been updated, the license check needs to re-run. | ✅ |
| `app/store/models/userState.ts` | `93-132` | This effect runs the actual verification of the license. Depending on the result we either set a license error or we set the license details. If the `source` of this effect is `INIITLA_LOAD` or `UI` a message will also be posted to the plugin code to save the license locally. | ✅ |
| `plugin/asyncMessageHandlers/initiate.ts` | `36` | This notifies the UI of the last opened time. |  |
| `app/components/Initiator.tsx` | `208-210` | This is the handler which receives the last opened time from the plugin | |
| `app/store/models/uiState.tsx` | `255-260` | Here we just store the last opened time locally. | |
|  | `322-326` | When we receive the last opened time, we need to also fetch the changelog. | |
| `plugin/asyncMessageHandlers/initiate.ts` | `37` | This notifies the UI of the saved storage type. |  |
| `app/components/Initiator.tsx` | `139-141` | This is the handler which receives storage type from the plugin | |
| `app/store/models/uiState.tsx` | `225-230` | Here we just store the storage type locally. | |
| `plugin/asyncMessageHandlers/initiate.ts` | `39-40` | Here we read the locally saved API providers and notify the UI of these. | ✅ |
| `app/components/Initiator.tsx` | `188-191` | This is the handler which receives the API providers from the plugin | ✅ |
| `app/store/models/uiState.tsx` | `243-248` | Here we just store the received API providers locally | ✅ |
| `plugin/asyncMessageHandlers/initiate.ts` | `41-51` | Here we are reading the local token data and inform the UI of these. If these are not the same as the last pushed values (for remote storage), the user should be prompted whether to use these values or whether to discard them. | ✅ |
| `app/components/Initiator.tsx` | `95-114` | This is the handler which receives the local token values from the plugin | ✅ |
| `utils/fetchFeatureFlags.ts` | `...` | This utility function is used to fetch the available feature flags based on the license. This is required to determine the available functions | ✅ |
| `app/components/Initiator.tsx` | `46-52` | This code can be triggered if the user confirms pulling the tokens or if there are no pending changes. | ✅ |
| `plugin/asyncMessageHandlers/getApiCredentials.ts` | `...` | This is the handler for the `GET_API_CREDENTIALS` message. It will get the locally stored API credentials and attempt to match it with the selected storage provider. | ✅ |
| `plugin/compareProviders.ts` | `...` | This code informs the UI of the matched API credentials or informs the UI that there are no matching credentials stored locally. | ✅ |
| `app/components/Initiator.tsx` | `142-187` | This is the handler which receives the API credentials from the plugin. This is also where we will actually pull the tokens. | ✅ |

As you may notice this logic is quite scattered and should/can be optimized as proposed below.

## [TODO] Desired situation
We should simply split up the logic in 2 parts - the plugin side and the client side.
1. First we need to get all the locally stored data as well as the user information and send it to the client. This is the base starting point for our UI.
2. We can use this information to determine the license validity, get the feature flags and fetch the remote data all in one go.
3. Any information that needs to be updated on the plugin side can be sent back once.