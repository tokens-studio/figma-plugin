# Group Description Management System Implementation Plan

## Overview

This document outlines the implementation plan for adding group description management functionality to the Tokens Studio for Figma plugin. This feature enables users to add, edit, and manage descriptions for token groups in the DTCG (Design Token Community Group) format.

## Context

Currently, the plugin supports individual token descriptions but lacks group-level description functionality. This feature will allow users to:
- Add descriptions to token groups via the list interface
- View group descriptions when available
- Export group descriptions in DTCG format
- Maintain group metadata in the internal state

**Important Note**: This feature requires the DTCG format and will not work with legacy token formats.

## Technical Requirements

### 1. DTCG Format Group Description Structure

Groups with descriptions will follow this JSON structure:
```json
{
  "colors": {
    "$description": "Brand and semantic color tokens",
    "brand": {
      "$description": "Primary brand colors",
      "primary": {
        "$type": "color",
        "$value": "#007bff",
        "$description": "Primary brand color"
      }
    }
  }
}
```

### 2. Parsing Logic Requirements

The parsing system must identify group descriptions by detecting:
- JSON objects with a `$description` key
- No `$value` key present (indicating it's a group, not a token)
- Store group metadata separately from token data

### 3. Internal State Management

Group metadata will be stored alongside existing token data:
```typescript
interface GroupMetadata {
  path: string;        // e.g., "colors.brand"
  description: string; // Group description text
  tokenSet: string;    // Which token set this belongs to
}
```

## Implementation Plan

### Phase 1: Core Data Structure and Types

#### 1.1 Type Definitions
**Files to create/modify:**
- `src/types/GroupMetadata.ts` (new)
- `src/types/tokens/index.ts` (extend exports)

**Implementation:**
```typescript
// src/types/GroupMetadata.ts
export interface GroupMetadata {
  path: string;
  description: string;
  tokenSet: string;
  lastModified?: string;
}

export interface GroupMetadataMap {
  [key: string]: GroupMetadata; // key is `${tokenSet}.${path}`
}
```

#### 1.2 State Structure Extension
**Files to modify:**
- `src/types/tokens/TokensStore.ts`

**Implementation:**
Extend the `TokenStore` interface to include group metadata:
```typescript
export interface TokenStore {
  values: TokensStoreValuesSet;
  themes: ThemeObject[];
  activeTheme: Record<string, string> | {};
  usedTokenSet: UsedTokenSetsMap;
  groupMetadata?: GroupMetadataMap; // New addition
}
```

### Phase 2: Parsing Logic Enhancement

#### 2.1 Group Description Detection
**Files to modify:**
- `src/utils/convertTokens.tsx`

**Implementation:**
Extend the `checkForTokens` function to detect and capture group descriptions:

```typescript
// Add to the function parameters
groupMetadata?: GroupMetadata[]

// Add detection logic for group descriptions
if (typeof token === 'object' && '$description' in token && !('$value' in token)) {
  // This is a group with description
  const groupPath = path || tokenKey;
  groupMetadata?.push({
    path: groupPath,
    description: token.$description as string,
    tokenSet: currentTokenSet, // passed from context
  });
}
```

#### 2.2 Parse Token Values Enhancement
**Files to modify:**
- `src/utils/parseTokenValues.ts`

**Implementation:**
Modify to return both tokens and group metadata:
```typescript
export default function parseTokenValues(tokens: SetTokenDataPayload['values']): {
  tokens: TokenStore['values'];
  groupMetadata: GroupMetadataMap;
} {
  // Enhanced parsing logic to capture group metadata
}
```

### Phase 3: State Management

#### 3.1 Redux State Management
**Files to modify:**
- `src/app/store/models/tokenState.tsx`

**Implementation:**
Add group metadata management actions:
```typescript
// New actions
setGroupMetadata(payload: GroupMetadataMap) {
  this.groupMetadata = payload;
},

updateGroupDescription(payload: { path: string; description: string; tokenSet: string }) {
  const key = `${payload.tokenSet}.${payload.path}`;
  if (!this.groupMetadata) this.groupMetadata = {};
  this.groupMetadata[key] = {
    path: payload.path,
    description: payload.description,
    tokenSet: payload.tokenSet,
    lastModified: new Date().toISOString(),
  };
},

deleteGroupMetadata(payload: { path: string; tokenSet: string }) {
  const key = `${payload.tokenSet}.${payload.path}`;
  if (this.groupMetadata && this.groupMetadata[key]) {
    delete this.groupMetadata[key];
  }
},
```

#### 3.2 Selectors
**Files to create:**
- `src/selectors/groupMetadataSelector.ts`

**Implementation:**
```typescript
import { createSelector } from 'reselect';
import { tokenStateSelector } from './tokenStateSelector';

export const groupMetadataSelector = createSelector(
  tokenStateSelector,
  (state) => state.groupMetadata || {}
);

export const getGroupDescriptionSelector = (tokenSet: string, path: string) =>
  createSelector(
    groupMetadataSelector,
    (metadata) => metadata[`${tokenSet}.${path}`]?.description
  );
```

### Phase 4: UI Components

#### 4.1 Group Description Display
**Files to modify:**
- `src/app/components/TokenGroup/TokenGroupHeading.tsx`

**Implementation:**
Add group description display below the group heading:
```typescript
// Add selector import
import { getGroupDescriptionSelector } from '@/selectors/groupMetadataSelector';

// Add to component
const groupDescription = useSelector(getGroupDescriptionSelector(activeTokenSet, path));

// Add to JSX
{groupDescription && (
  <Text size="small" css={{ color: '$fgMuted', marginTop: '$1' }}>
    {groupDescription}
  </Text>
)}
```

#### 4.2 Group Description Editing
**Files to create:**
- `src/app/components/modals/EditGroupDescriptionModal.tsx`

**Implementation:**
Create a modal for editing group descriptions:
```typescript
export interface Props {
  isOpen: boolean;
  onClose: () => void;
  groupPath: string;
  tokenSet: string;
  currentDescription?: string;
}

export function EditGroupDescriptionModal({ isOpen, onClose, groupPath, tokenSet, currentDescription }: Props) {
  // Modal implementation with form for editing description
}
```

#### 4.3 Context Menu Integration
**Files to modify:**
- `src/app/components/TokenGroup/TokenGroupHeading.tsx`

**Implementation:**
Add "Edit Description" option to the existing context menu:
```typescript
// Add to context menu items
{
  label: t('editDescription'),
  onClick: () => setShowEditDescriptionModal(true),
  disabled: editProhibited || activeTokenSetReadOnly,
}
```

### Phase 5: Export Functionality

#### 5.1 JSON Export with Group Descriptions
**Files to modify:**
- `src/utils/convertTokensToObject.ts`

**Implementation:**
Enhance the conversion to include group descriptions:
```typescript
export default function convertTokensToObject(
  tokens: Record<string, AnyTokenList>,
  storeTokenIdInJsonEditor: boolean,
  groupMetadata?: GroupMetadataMap
) {
  // Enhanced logic to inject group descriptions at appropriate levels
  
  // For each group level, check if metadata exists and add $description
  if (groupMetadata) {
    Object.entries(groupMetadata).forEach(([key, metadata]) => {
      const [tokenSet, ...pathParts] = key.split('.');
      if (tokenSet === currentTokenSet) {
        set(tokenGroupObj, [...pathParts, '$description'], metadata.description);
      }
    });
  }
}
```

#### 5.2 Export Integration
**Files to modify:**
- `src/app/components/ExportProvider/SingleFileExport.tsx`

**Implementation:**
Include group metadata in the export process:
```typescript
// Pass group metadata to conversion function
const returnValue = convertTokensToObject(tokens, storeTokenIdInJsonEditor, groupMetadata);
```

### Phase 6: Testing

#### 6.1 Unit Tests
**Files to create:**
- `src/utils/__tests__/convertTokensWithGroupMetadata.test.ts`
- `src/app/store/models/__tests__/groupMetadata.test.ts`
- `src/selectors/__tests__/groupMetadataSelector.test.ts`

#### 6.2 Component Tests
**Files to create:**
- `src/app/components/modals/__tests__/EditGroupDescriptionModal.test.tsx`

#### 6.3 Integration Tests
**Files to create:**
- `src/app/store/__tests__/groupDescriptionIntegration.test.ts`

## Success Criteria

1. **Parsing Success**: The system correctly identifies and parses group descriptions from DTCG format JSON
2. **State Management Success**: Group metadata is properly stored, updated, and retrieved from the Redux store
3. **UI Success**: Users can view and edit group descriptions through the list interface
4. **Export Success**: JSON export includes group descriptions in the correct DTCG format
5. **Compatibility Success**: Existing token functionality remains unaffected

## Migration Strategy

Since this is a new feature:
1. No data migration is required
2. Existing token sets without group descriptions will continue to work normally
3. Group descriptions are optional and don't affect existing workflows
4. Feature is only available in DTCG format mode

## Rollout Plan

1. **Phase 1-2**: Core parsing and data structure (foundational, no UI impact)
2. **Phase 3**: State management (internal changes, no UI impact)
3. **Phase 4**: UI components (user-visible features)
4. **Phase 5**: Export functionality (completes the feature loop)
5. **Phase 6**: Testing and validation

## Risk Mitigation

1. **Parsing Errors**: Implement robust error handling in parsing logic
2. **State Corruption**: Validate group metadata structure before storage
3. **Export Issues**: Fallback to existing export if group metadata is invalid
4. **UI Performance**: Lazy load group descriptions and implement memoization
5. **DTCG Compatibility**: Ensure strict adherence to DTCG specification

## Future Enhancements

1. **Bulk Group Description Import**: Allow importing group descriptions from external files
2. **Group Description Templates**: Provide common description templates
3. **Search and Filter**: Enable searching tokens by group descriptions
4. **Markdown Support**: Rich text formatting for group descriptions
5. **Group Description History**: Track changes to group descriptions over time

---

This implementation plan provides a comprehensive roadmap for adding group description management to the Tokens Studio for Figma plugin while maintaining compatibility with existing functionality and adhering to the DTCG format specification.