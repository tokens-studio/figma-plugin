# Real-Time Multi-User Token Sync

## Overview

This feature enables automatic synchronization of token data across multiple users working on the same Figma file with the Tokens Studio plugin. When one user modifies tokens (add/edit/delete), all other users with the plugin open in the same file will automatically see the updates without needing to refresh or restart.

## How It Works

### 1. Detection (Plugin Side)

When a user modifies tokens in the plugin, the data is saved to Figma's shared plugin data storage. The plugin monitors document changes using Figma's `documentchange` event:

```typescript
figma.on('documentchange', (event: DocumentChangeEvent) => {
  sendDocumentChange(event);
});
```

The `sendDocumentChange` function filters for:
- Changes with `origin: 'REMOTE'` (from other users)
- Changes to the document root node (where token data is stored)
- Changes to token-related shared plugin data properties

When a remote token data change is detected:
1. The plugin reads the current `updatedAt` timestamp
2. Compares it to the last known timestamp to avoid duplicates
3. Sends a `TOKEN_DATA_CHANGED` message to the UI with the new timestamp

### 2. Reload (UI Side)

The UI (AppContainer component) listens for `TOKEN_DATA_CHANGED` messages:

```typescript
useEffect(() => {
  const handleTokenDataChanged = (msg) => {
    if (msg.type === AsyncMessageTypes.TOKEN_DATA_CHANGED) {
      // Request fresh token data from the plugin
      AsyncMessageChannel.ReactInstance.message({
        type: AsyncMessageTypes.RELOAD_TOKEN_DATA,
      }).then((tokenData) => {
        // Update Redux state with new tokens
        dispatch.tokenState.setTokenData(tokenData);
      });
    }
  };
  
  return AsyncMessageChannel.ReactInstance.attachMessageListener(handleTokenDataChanged);
}, [showLoadingScreen, startupProcess.isComplete, dispatch]);
```

### 3. Data Flow

```
User A modifies tokens
    ↓
Tokens saved to shared plugin data
    ↓
Figma broadcasts documentchange event
    ↓
User B's plugin detects REMOTE change to token data
    ↓
User B's plugin sends TOKEN_DATA_CHANGED to UI
    ↓
User B's UI requests fresh token data (RELOAD_TOKEN_DATA)
    ↓
User B's plugin returns latest token data
    ↓
User B's UI updates Redux state
    ↓
User B sees updated tokens automatically
```

## New Message Types

### TOKEN_DATA_CHANGED
- **Direction**: Plugin → UI
- **Purpose**: Notify UI that token data has changed from a remote user
- **Payload**: `{ updatedAt: string }`

### RELOAD_TOKEN_DATA
- **Direction**: UI → Plugin
- **Purpose**: Request fresh token data from storage
- **Response**: `{ values, themes, activeTheme, usedTokenSet }`

## Conflict Prevention

The implementation includes several safeguards:

1. **Timestamp Tracking**: Uses `lastKnownUpdatedAt` to prevent duplicate notifications
2. **Origin Filtering**: Only processes changes from `REMOTE` origin (not self-changes)
3. **Property Validation**: Only reacts to changes in token-related shared plugin data keys
4. **Conditional Loading**: Only activates after initial startup is complete

## Storage

Token data is stored in Figma's shared plugin data under the `tokens` namespace:
- `values` - Token sets and values
- `themes` - Theme configurations  
- `activeTheme` - Currently active theme
- `usedTokenSet` - Enabled token sets
- `updatedAt` - Last modification timestamp

The storage uses automatic chunking for large datasets (>95KB per chunk) to stay within Figma's limits.

## Benefits

- **No Manual Refresh**: Users automatically see changes made by collaborators
- **Prevents Data Loss**: All users work with the latest data
- **Better Collaboration**: Multiple designers can work on tokens simultaneously
- **Seamless Experience**: Works transparently in the background

## Limitations

- Only works for local document storage (not remote sync providers)
- Requires all users to have the plugin open to receive updates
- Does not resolve concurrent edit conflicts (last write wins)

## Future Enhancements

Potential improvements could include:
- Conflict resolution UI for simultaneous edits
- Change notifications showing who made what changes
- Undo/redo support across users
- Real-time cursor/selection indicators
