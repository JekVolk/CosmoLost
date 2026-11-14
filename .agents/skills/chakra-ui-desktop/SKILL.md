---
name: chakra-ui-desktop
description: >-
  Use this skill when designing UI layouts, theming, styling, and building components with Chakra UI
  for desktop applications with dark/light mode and OS-native look-and-feel.
---

# Chakra UI for Desktop Client Development

Chakra UI provides an accessible, modular, and composable component library. In desktop applications, Chakra UI delivers consistent styling, dark/light theme transitions, and responsive layout primitives.

## 1. Provider Setup in FSD Layer (`app/providers`)

In FSD, UI libraries must be initialized inside `src/app/providers/`:

```typescript
// src/app/providers/theme-provider.tsx
import { ChakraProvider, defaultSystem } from '@chakra-ui/react';
import React from 'react';

export const AppThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return <ChakraProvider value={defaultSystem}>{children}</ChakraProvider>;
};
```

## 2. Desktop Layout Structure (Header, Sidebar, Content)

Desktop apps feature standard desktop application chrome (Titlebar, Sidebar, Main Area, Statusbar):

```tsx
// Example layout composed in widgets layer
import { Box, Flex } from '@chakra-ui/react';
import { Header } from '@/widgets/header';
import { Sidebar } from '@/widgets/sidebar';

export const DesktopAppLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <Flex direction="column" height="100vh" width="100vw" overflow="hidden" bg="bg.canvas">
      {/* Draggable Titlebar & Header */}
      <Header />

      {/* Main workspace */}
      <Flex flex="1" overflow="hidden">
        <Sidebar />
        <Box as="main" flex="1" overflowY="auto" p="6">
          {children}
        </Box>
      </Flex>
    </Flex>
  );
};
```

## 3. UI Kit Encapsulation in `shared/ui`

Never scatter custom styles across all features. Encapsulate core UI elements in `src/shared/ui/`:

- `shared/ui/button`: Styled buttons with variant defaults.
- `shared/ui/card`: Desktop cards with border, padding, and subtle shadows.
- `shared/ui/dialog`: Modal and confirmation popups.
- `shared/ui/tooltip`: Accessible hover tooltips for compact desktop icon toolbars.

## 4. MCP Chakra UI Tool Usage

When the `chakra-ui` MCP is active:
- Query available components, recipes, and snippet configurations directly.
- Retrieve prop types and composition patterns for complex components (Tabs, Accordion, Menu, Popover).
