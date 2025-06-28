/**
 * Global type declarations for the Analytics Dashboard
 */

// Declare modules for libraries that don't have TypeScript definitions
declare module '*.svg' {
  import React = require('react');
  export const ReactComponent: React.FC<React.SVGProps<SVGSVGElement>>;
  const src: string;
  export default src;
}

declare module '*.png' {
  const content: string;
  export default content;
}

declare module '*.jpg' {
  const content: string;
  export default content;
}

declare module '*.json' {
  const content: Record<string, any>;
  export default content;
}

// Augment window interface for potential global variables
interface Window {
  // Add any window extensions here if needed
}

// Fix for MUI theme typing in custom components
declare module '@mui/material/styles' {
  interface Theme {
    // Add any custom theme properties here if needed
  }
  
  interface ThemeOptions {
    // Add any custom theme options here if needed
  }
}