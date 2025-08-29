---
"@tokens-studio/figma-plugin": patch
---

Fix gradient anchor points positioning issue for non-45° angles

Resolves issue #2331 where gradient anchor points (position percentages) would shift when applying gradient tokens to Figma shapes. The issue was caused by incorrect scaling computation in the gradient transform matrix for angles that are not multiples of 45°.

Changes:
- Updated gradient transform scaling calculation to use geometrically accurate computation for non-45° angles
- Preserved the original scaling for 45° multiples to maintain backward compatibility  
- Added comprehensive tests to verify gradient positioning is preserved across different angles

This ensures that gradient tokens maintain their exact positioning when applied from Tokens Studio back to Figma shapes, fixing the reported position drift (e.g., 0% → 8.33%, 83.33% → 77.78%).

