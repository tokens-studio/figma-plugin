import { StorageType } from '@/types/StorageType';
import { AnyTokenList, SingleToken } from '@/types/tokens';
import { getTokensWithValuesForPluginTokens } from '@/utils/getTokensWithValuesForPluginTokens';
import { getResolvedTokens } from '@/utils/getResolvedTokens';
import { TokenTypes } from '@/constants/TokenTypes';
import { Properties } from '@/constants/Properties';

// Type for documentation generation options
type LivingDocumentationOptions = {
  tokenSets: string[];
  includeAllTokens: boolean;
  documentationLayout: 'grid' | 'list';
  tokens: Record<string, AnyTokenList>;
  activeTheme?: Record<string, string>;
  storageType: StorageType;
};

// Type for documentation generation result
type LivingDocumentationResult = {
  success: boolean;
  message: string;
  stats?: {
    tokensProcessed: number;
    componentsCreated: number;
    componentsUpdated: number;
  };
};

// Function to find or create a documentation component
async function findOrCreateDocumentationComponent(name: string): Promise<ComponentNode | null> {
  try {
    // Check if the component already exists
    const existingComponent = figma.root.findOne(
      (node) => node.type === 'COMPONENT' && node.name === name
    ) as ComponentNode | null;

    if (existingComponent) {
      return existingComponent;
    }
    
    // If no component exists, create a new one
    const component = figma.createComponent();
    component.name = name;
    component.resize(400, 150); // Default size
    
    return component;
  } catch (error) {
    console.error('Error finding or creating documentation component:', error);
    return null;
  }
}

// Function to create documentation components for tokens
async function createDocumentationForToken(
  token: SingleToken<any>, 
  tokenName: string,
  resolvedValue: any
): Promise<boolean> {
  try {
    // Find or create a component for this token
    const component = await findOrCreateDocumentationComponent(`TokenDoc/${tokenName}`);
    if (!component) {
      return false;
    }

    // Reset children
    component.children.forEach(child => child.remove());
    
    // Create text nodes for token properties
    const nameText = figma.createText();
    await figma.loadFontAsync({ family: "Inter", style: "Regular" });
    nameText.characters = tokenName;
    nameText.name = "tokenName";
    nameText.x = 16;
    nameText.y = 16;
    nameText.fontSize = 16;
    nameText.fontWeight = 600;
    component.appendChild(nameText);
    
    const valueText = figma.createText();
    valueText.characters = String(resolvedValue);
    valueText.name = "tokenValue";
    valueText.x = 16;
    valueText.y = 48;
    valueText.fontSize = 14;
    component.appendChild(valueText);
    
    // Add description if available
    if (token.description) {
      const descText = figma.createText();
      descText.characters = token.description;
      descText.name = "description";
      descText.x = 16;
      descText.y = 80;
      descText.fontSize = 12;
      descText.opacity = 0.7;
      component.appendChild(descText);
    }
    
    // For color tokens, add a color swatch
    if (token.type === TokenTypes.COLOR && typeof resolvedValue === 'string') {
      try {
        const swatch = figma.createRectangle();
        swatch.name = "colorSwatch";
        swatch.x = 16;
        swatch.y = 110;
        swatch.resize(64, 24);
        
        // Try to parse the color
        const rgbValue = resolvedValue.trim().toLowerCase();
        if (rgbValue.startsWith('#')) {
          const r = parseInt(rgbValue.substr(1, 2), 16) / 255;
          const g = parseInt(rgbValue.substr(3, 2), 16) / 255;
          const b = parseInt(rgbValue.substr(5, 2), 16) / 255;
          
          swatch.fills = [{
            type: 'SOLID',
            color: { r, g, b },
          }];
        }
        
        component.appendChild(swatch);
      } catch (err) {
        console.error('Error creating color swatch:', err);
      }
    }
    
    // For spacing/sizing tokens, add a visual representation
    if (
      token.type === TokenTypes.SPACING || 
      token.type === TokenTypes.SIZING || 
      token.type === Properties.borderRadius
    ) {
      try {
        const visualizer = figma.createRectangle();
        visualizer.name = "visualizer";
        visualizer.x = 16;
        visualizer.y = 110;
        
        // Parse the value - assuming it's in pixels
        let size = 24; // Default
        if (typeof resolvedValue === 'string' || typeof resolvedValue === 'number') {
          const numValue = typeof resolvedValue === 'string' 
            ? parseFloat(resolvedValue) 
            : resolvedValue;
          
          if (!isNaN(numValue)) {
            // Cap the visualization at a reasonable size
            size = Math.min(Math.max(numValue, 4), 64);
          }
        }
        
        visualizer.resize(size, size);
        
        // For border radius, apply the radius
        if (token.type === Properties.borderRadius) {
          visualizer.cornerRadius = size / 4;
        }
        
        visualizer.fills = [{
          type: 'SOLID',
          color: { r: 0.8, g: 0.8, b: 0.8 },
        }];
        
        component.appendChild(visualizer);
      } catch (err) {
        console.error('Error creating size visualizer:', err);
      }
    }
    
    return true;
  } catch (error) {
    console.error('Error creating documentation for token:', error);
    return false;
  }
}

// Main function to generate living documentation
export async function generateLivingDocumentation(options: LivingDocumentationOptions): Promise<LivingDocumentationResult> {
  try {
    const { tokenSets, includeAllTokens, tokens, activeTheme, storageType } = options;
    
    // Validate inputs
    if (!tokens || Object.keys(tokens).length === 0) {
      return {
        success: false,
        message: 'No tokens available to document',
      };
    }
    
    // Filter tokens based on selected token sets
    const selectedTokenSets = includeAllTokens 
      ? Object.keys(tokens)
      : tokenSets;
    
    if (selectedTokenSets.length === 0) {
      return {
        success: false,
        message: 'No token sets selected',
      };
    }

    // Get all tokens with their resolved values
    const allTokens: Record<string, SingleToken<any>> = {};
    
    // Merge all tokens from selected sets
    selectedTokenSets.forEach(set => {
      if (tokens[set]) {
        Object.entries(tokens[set]).forEach(([name, token]) => {
          allTokens[`${set}/${name}`] = token as SingleToken<any>;
        });
      }
    });
    
    // Resolve token values (this handles aliases and math operations)
    const resolvedTokens = getResolvedTokens(allTokens);
    
    // Create documentation components
    let tokensProcessed = 0;
    let componentsCreated = 0;
    let componentsUpdated = 0;
    
    // Create a parent frame for the documentation if needed
    const docFrameName = 'Tokens Studio Documentation';
    let docFrame = figma.root.findOne(node => 
      node.type === 'FRAME' && node.name === docFrameName
    ) as FrameNode | null;
    
    if (!docFrame) {
      docFrame = figma.createFrame();
      docFrame.name = docFrameName;
      docFrame.layoutMode = 'VERTICAL';
      docFrame.primaryAxisSizingMode = 'AUTO';
      docFrame.counterAxisSizingMode = 'AUTO';
      docFrame.itemSpacing = 16;
      docFrame.paddingTop = 24;
      docFrame.paddingRight = 24;
      docFrame.paddingBottom = 24;
      docFrame.paddingLeft = 24;
      docFrame.fills = [{ type: 'SOLID', color: { r: 1, g: 1, b: 1 } }];
    }
    
    // Process each token and create documentation
    for (const [tokenName, token] of Object.entries(resolvedTokens)) {
      // Check if the token has a value
      if (token && 'value' in token) {
        const resolvedValue = token.value;
        
        // Create documentation for this token
        const success = await createDocumentationForToken(
          token as SingleToken<any>,
          tokenName,
          resolvedValue
        );
        
        if (success) {
          tokensProcessed++;
          componentsCreated++;
          
          // Find the component instance for this documentation component
          const componentNode = figma.root.findOne(
            (node) => node.type === 'COMPONENT' && node.name === `TokenDoc/${tokenName}`
          ) as ComponentNode;
          
          if (componentNode) {
            // Create an instance of the component in the documentation frame
            const instance = componentNode.createInstance();
            instance.name = tokenName;
            
            // Add it to the documentation frame
            docFrame.appendChild(instance);
          }
        }
      }
    }
    
    // Organize components in the frame based on layout preference
    if (docFrame && docFrame.children.length > 0) {
      if (options.documentationLayout === 'grid') {
        docFrame.layoutMode = 'HORIZONTAL';
        docFrame.primaryAxisSizingMode = 'FIXED';
        docFrame.counterAxisSizingMode = 'AUTO';
        docFrame.itemSpacing = 16;
        docFrame.counterAxisSpacing = 16;
        docFrame.width = Math.min(docFrame.children.length * 400, 1200);
        docFrame.layoutWrap = 'WRAP';
      } else {
        // List layout
        docFrame.layoutMode = 'VERTICAL';
        docFrame.primaryAxisSizingMode = 'AUTO';
        docFrame.counterAxisSizingMode = 'AUTO';
        docFrame.itemSpacing = 16;
      }
    }
    
    // Success result with stats
    return {
      success: true,
      message: `Documentation generated successfully for ${tokensProcessed} tokens`,
      stats: {
        tokensProcessed,
        componentsCreated,
        componentsUpdated,
      }
    };
  } catch (error) {
    console.error('Error generating living documentation:', error);
    return {
      success: false,
      message: `Error generating documentation: ${error.message || 'Unknown error'}`,
    };
  }
}