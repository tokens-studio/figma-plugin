#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const glob = require('glob');

const PROJECT_ROOT = process.cwd();

// File patterns to analyze
const SOURCE_PATTERNS = [
  'src/**/*.{ts,tsx,js,jsx}',
  'src/**/*.json',
  'src/**/*.svg',
  'src/**/*.css',
  'src/**/*.md',
  'tests/**/*.{ts,tsx,js,jsx}',
  'cypress/**/*.{ts,tsx,js,jsx}',
  'benchmark/**/*.{ts,tsx,js,jsx}',
  'scripts/**/*.{ts,tsx,js,jsx,mjs}',
  '.storybook/**/*.{ts,tsx,js,jsx}',
  '*.{ts,tsx,js,jsx,json,md}',
];

// Files to ignore in analysis
const IGNORE_PATTERNS = [
  'node_modules/**',
  'dist/**',
  'preview/**',
  'coverage/**',
  '.git/**',
  '**/*.test.{ts,tsx,js,jsx}',
  '**/*.spec.{ts,tsx,js,jsx}',
  '**/index.{ts,tsx,js,jsx}', // Index files often just re-export
];

class UnusedFileAnalyzer {
  constructor() {
    this.allFiles = [];
    this.usedFiles = new Set();
    this.entryPoints = [
      'src/app/index.tsx',
      'src/plugin/controller.ts',
      'webpack.config.js',
      'webpack-transform.config.js',
      'webpack-benchmark.config.js',
      'jest.config.ts',
      'cypress.config.ts',
      'package.json',
      'manifest.json',
    ];
  }

  getAllFiles() {
    console.log('🔍 Scanning for all source files...');
    
    SOURCE_PATTERNS.forEach(pattern => {
      const files = glob.sync(pattern, { 
        cwd: PROJECT_ROOT,
        ignore: IGNORE_PATTERNS 
      });
      this.allFiles.push(...files.map(f => path.resolve(PROJECT_ROOT, f)));
    });

    // Remove duplicates
    this.allFiles = [...new Set(this.allFiles)];
    console.log(`Found ${this.allFiles.length} files to analyze`);
    return this.allFiles;
  }

  readFileContent(filePath) {
    try {
      return fs.readFileSync(filePath, 'utf8');
    } catch (error) {
      console.warn(`Warning: Could not read ${filePath}: ${error.message}`);
      return '';
    }
  }

  extractImportsAndReferences(content, filePath) {
    const references = new Set();
    
    // TypeScript/JavaScript imports
    const importPatterns = [
      // import statements
      /import\s+.*?from\s+['"`]([^'"`]+)['"`]/g,
      // require statements
      /require\s*\(\s*['"`]([^'"`]+)['"`]\s*\)/g,
      // dynamic imports
      /import\s*\(\s*['"`]([^'"`]+)['"`]\s*\)/g,
      // SVG imports (common in this project)
      /from\s+['"`]([^'"`]*\.svg)['"`]/g,
    ];

    importPatterns.forEach(pattern => {
      let match;
      while ((match = pattern.exec(content)) !== null) {
        references.add(match[1]);
      }
    });

    // Asset references in strings
    const assetPatterns = [
      // File extensions that might be referenced as strings
      /['"`]([^'"`]*\.(?:svg|png|jpg|jpeg|gif|webp|json|md))['"`]/g,
      // Icon names or component references
      /Icon(\w+)/g,
    ];

    assetPatterns.forEach(pattern => {
      let match;
      while ((match = pattern.exec(content)) !== null) {
        if (pattern.source.includes('Icon')) {
          // Convert IconName to potential file names
          const iconName = match[1];
          references.add(`${iconName.toLowerCase()}.svg`);
          references.add(`${iconName}.svg`);
        } else {
          references.add(match[1]);
        }
      }
    });

    return references;
  }

  resolveReference(reference, fromFile) {
    const fromDir = path.dirname(fromFile);
    
    // Handle relative imports
    if (reference.startsWith('./') || reference.startsWith('../')) {
      const resolved = path.resolve(fromDir, reference);
      
      // Try with different extensions
      const extensions = ['', '.ts', '.tsx', '.js', '.jsx', '.json', '.svg'];
      for (const ext of extensions) {
        const withExt = resolved + ext;
        if (fs.existsSync(withExt)) {
          return withExt;
        }
      }
      
      // Try index files
      for (const ext of ['.ts', '.tsx', '.js', '.jsx']) {
        const indexFile = path.join(resolved, `index${ext}`);
        if (fs.existsSync(indexFile)) {
          return indexFile;
        }
      }
    }
    
    // Handle absolute imports (from project root or src)
    if (!reference.startsWith('.')) {
      const possiblePaths = [
        path.resolve(PROJECT_ROOT, reference),
        path.resolve(PROJECT_ROOT, 'src', reference),
      ];
      
      for (const basePath of possiblePaths) {
        const extensions = ['', '.ts', '.tsx', '.js', '.jsx', '.json', '.svg'];
        for (const ext of extensions) {
          const withExt = basePath + ext;
          if (fs.existsSync(withExt)) {
            return withExt;
          }
        }
        
        // Try index files
        for (const ext of ['.ts', '.tsx', '.js', '.jsx']) {
          const indexFile = path.join(basePath, `index${ext}`);
          if (fs.existsSync(indexFile)) {
            return indexFile;
          }
        }
      }
    }
    
    return null;
  }

  analyzeFile(filePath) {
    if (this.usedFiles.has(filePath)) {
      return; // Already analyzed
    }
    
    this.usedFiles.add(filePath);
    const content = this.readFileContent(filePath);
    const references = this.extractImportsAndReferences(content, filePath);
    
    references.forEach(ref => {
      const resolvedPath = this.resolveReference(ref, filePath);
      if (resolvedPath && !this.usedFiles.has(resolvedPath)) {
        this.analyzeFile(resolvedPath);
      }
    });
  }

  findUnusedFiles() {
    console.log('📊 Starting dependency analysis...');
    
    // Start from entry points
    this.entryPoints.forEach(entryPoint => {
      const fullPath = path.resolve(PROJECT_ROOT, entryPoint);
      if (fs.existsSync(fullPath)) {
        console.log(`Analyzing entry point: ${entryPoint}`);
        this.analyzeFile(fullPath);
      }
    });

    // Find unused files
    const unusedFiles = this.allFiles.filter(file => !this.usedFiles.has(file));
    
    return {
      total: this.allFiles.length,
      used: this.usedFiles.size,
      unused: unusedFiles.length,
      unusedFiles: unusedFiles.map(f => path.relative(PROJECT_ROOT, f))
    };
  }

  generateReport() {
    this.getAllFiles();
    const result = this.findUnusedFiles();
    
    console.log('\n📋 ANALYSIS REPORT');
    console.log('==================');
    console.log(`Total files analyzed: ${result.total}`);
    console.log(`Files in use: ${result.used}`);
    console.log(`Potentially unused files: ${result.unused}`);
    
    if (result.unusedFiles.length > 0) {
      console.log('\n🗑️  POTENTIALLY UNUSED FILES:');
      console.log('================================');
      
      // Group by directory for better readability
      const byDirectory = {};
      result.unusedFiles.forEach(file => {
        const dir = path.dirname(file);
        if (!byDirectory[dir]) byDirectory[dir] = [];
        byDirectory[dir].push(path.basename(file));
      });
      
      Object.keys(byDirectory).sort().forEach(dir => {
        console.log(`\n📁 ${dir}/`);
        byDirectory[dir].sort().forEach(file => {
          console.log(`   • ${file}`);
        });
      });
    }
    
    return result;
  }
}

// Run the analysis
if (require.main === module) {
  const analyzer = new UnusedFileAnalyzer();
  analyzer.generateReport();
}

module.exports = UnusedFileAnalyzer;