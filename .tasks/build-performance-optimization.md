# Build Performance Optimization

**Priority**: Medium  
**Type**: Performance  
**Effort**: Medium (2-3 days)  

## Problem Description

The webpack build configuration is complex and potentially inefficient, with build times and bundle sizes that could be optimized for better developer experience and user performance.

### Current Issues:
- **Complex Configuration**: Multiple webpack configs with overlapping concerns
- **Large Dependency Tree**: 250+ dependencies increase bundle size
- **Build Time**: Potentially slow build times affecting developer productivity  
- **Bundle Analysis**: Limited visibility into what's contributing to bundle size
- **Development vs Production**: Inconsistent optimizations between environments

### Evidence from Analysis:
```javascript
// webpack.config.js shows complexity:
- Multiple entry points (ui, code)
- Complex plugin chain (Sentry, HtmlWebpack, ReactRefresh, etc.)
- Speed measurement plugin disabled (measureSpeed = false)
- Different configs for different environments
```

## Business Impact

- **Developer Productivity**: Slow builds interrupt development flow
- **User Experience**: Large bundles increase load times in Figma
- **CI/CD Performance**: Slow builds delay deployments
- **Resource Costs**: Inefficient builds waste compute resources

## Success Criteria

- [ ] Reduce development build time by 30%
- [ ] Reduce production bundle size by 20%
- [ ] Improve hot reload performance in development
- [ ] Enable bundle analysis in CI pipeline
- [ ] Maintain current functionality and compatibility

## Implementation Plan

### Phase 1: Analyze Current Performance (1 day)

1. **Enable Build Metrics**:
   ```javascript
   // Enable SpeedMeasurePlugin temporarily
   const measureSpeed = true; // was false
   
   // Add bundle analyzer in CI
   if (process.env.CI) {
     plugins.push(new BundleAnalyzerPlugin({
       analyzerMode: 'json',
       openAnalyzer: false
     }));
   }
   ```

2. **Baseline Measurements**:
   ```bash
   # Measure current build times
   time yarn build        # Production build
   time yarn build:dev    # Development build
   time yarn start        # Development server startup
   
   # Analyze bundle size
   yarn build && npx webpack-bundle-analyzer dist/stats.json
   ```

3. **Identify Bottlenecks**:
   - Slowest webpack plugins
   - Largest bundle dependencies  
   - Module resolution performance
   - TypeScript compilation time

### Phase 2: Optimize Development Builds (1 day)

1. **TypeScript Compilation**:
   ```javascript
   // Use SWC instead of ts-loader for faster transpilation
   module.exports = {
     module: {
       rules: [
         {
           test: /\.tsx?$/,
           use: {
             loader: 'swc-loader',
             options: {
               jsc: {
                 parser: { syntax: 'typescript', tsx: true },
                 transform: { react: { runtime: 'automatic' } }
               }
             }
           }
         }
       ]
     }
   };
   ```

2. **Improve Hot Reload**:
   ```javascript
   // Optimize dev server configuration
   devServer: {
     hot: true,
     liveReload: false,
     devMiddleware: {
       writeToDisk: false, // Keep files in memory
     },
     static: {
       watch: {
         ignored: /node_modules/, // Don't watch node_modules
       }
     }
   }
   ```

3. **Plugin Optimization**:
   ```javascript
   // Only include necessary plugins in development
   const isDev = mode === 'development';
   
   plugins: [
     ...(isDev ? [
       new ReactRefreshPlugin(),
       new ForkTsCheckerWebpackPlugin({ async: true })
     ] : [
       new SentryPlugin(), // Only in production
       new BundleAnalyzerPlugin()
     ])
   ]
   ```

### Phase 3: Optimize Production Builds (1 day)

1. **Tree Shaking and Code Splitting**:
   ```javascript
   module.exports = {
     optimization: {
       usedExports: true,
       sideEffects: false,
       splitChunks: {
         chunks: 'all',
         cacheGroups: {
           vendor: {
             test: /[\\/]node_modules[\\/]/,
             name: 'vendors',
             chunks: 'all',
           },
           common: {
             name: 'common',
             minChunks: 2,
             chunks: 'all',
             enforce: true
           }
         }
       }
     }
   };
   ```

2. **Dependency Optimization**:
   ```javascript
   // Analyze and replace heavy dependencies
   resolve: {
     alias: {
       // Replace heavy lodash with specific functions
       'lodash': 'lodash-es',
       // Use smaller date library
       'moment': 'dayjs'
     }
   }
   ```

3. **Asset Optimization**:
   ```javascript
   // Optimize images and fonts
   module: {
     rules: [
       {
         test: /\.(png|jpg|gif|svg)$/,
         use: [
           {
             loader: 'url-loader',
             options: {
               limit: 8192, // Inline small images
               name: '[name].[contenthash:8].[ext]'
             }
           }
         ]
       }
     ]
   }
   ```

## Specific Optimizations

### 1. Remove Unused Dependencies
```bash
# Audit dependencies for unused packages
npx depcheck

# Examples of potentially unused dependencies:
# - Old webpack plugins
# - Duplicate utilities (lodash vs lodash-es)
# - Unused testing utilities
# - Legacy polyfills
```

### 2. Bundle Splitting Strategy
```javascript
// Separate bundle for each entry point
entry: {
  ui: './src/app/index.tsx',
  code: './src/plugin/controller.ts',
  // Split shared utilities
  shared: ['react', 'react-dom', '@tokens-studio/ui']
}
```

### 3. CSS Optimization
```javascript
// Optimize CSS loading
module: {
  rules: [
    {
      test: /\.css$/,
      use: [
        isDev ? 'style-loader' : MiniCssExtractPlugin.loader,
        'css-loader',
        'postcss-loader'
      ]
    }
  ]
}
```

### 4. Source Map Optimization
```javascript
// Different source maps for dev vs prod
devtool: isDev ? 'eval-cheap-module-source-map' : 'source-map'
```

## Performance Monitoring

### 1. Build Time Tracking
```javascript
// Add build time reporting
class BuildTimePlugin {
  apply(compiler) {
    compiler.hooks.done.tap('BuildTimePlugin', (stats) => {
      const buildTime = stats.endTime - stats.startTime;
      console.log(`Build completed in ${buildTime}ms`);
    });
  }
}
```

### 2. Bundle Size Monitoring
```json
// package.json scripts
{
  "analyze": "yarn build && npx webpack-bundle-analyzer dist/stats.json",
  "size-check": "bundlesize",
  "perf": "yarn build && node scripts/performance-check.js"
}
```

### 3. CI Integration
```yaml
# .github/workflows/performance.yml
- name: Performance Check
  run: |
    yarn build
    yarn size-check
    # Fail if bundle size increases by >10%
```

## Migration Strategy

1. **Incremental Changes**: Apply optimizations one at a time
2. **A/B Testing**: Compare build times before/after each change
3. **Rollback Plan**: Keep original config files for quick revert
4. **Team Communication**: Share performance improvements with team

## Files to Modify

```
MODIFY: webpack.config.js (main optimization)
MODIFY: webpack-benchmark.config.js 
MODIFY: webpack-transform.config.js
MODIFY: package.json (scripts and dependencies)
CREATE: scripts/performance-check.js
CREATE: bundlesize.config.json
UPDATE: .github/workflows/ (CI performance checks)
```

## Verification Steps

1. **Build Time Comparison**:
   ```bash
   # Before optimizations
   time yarn build  # Record baseline
   
   # After optimizations  
   time yarn build  # Should be 30% faster
   ```

2. **Bundle Size Analysis**:
   ```bash
   # Compare bundle sizes
   yarn analyze
   # Check for:
   # - Reduced vendor bundle size
   # - Proper code splitting
   # - No duplicate dependencies
   ```

3. **Functionality Testing**:
   ```bash
   # Ensure all features still work
   yarn test
   yarn build && yarn serve
   # Manual testing of plugin in Figma
   ```

4. **Development Experience**:
   ```bash
   # Test hot reload performance
   yarn start
   # Make changes and measure reload time
   ```

## Risk Mitigation

- **Backup Configuration**: Keep original webpack configs during migration
- **Feature Parity**: Ensure all current functionality is preserved
- **Browser Compatibility**: Test in all supported browsers
- **Figma Plugin API**: Ensure plugin still works correctly in Figma
- **Incremental Rollout**: Deploy optimizations gradually