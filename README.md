# React SDK for Unrevealed

React sdk for [Unrevealed](https://unrevealed.tech/).

## Installation

1. Install the sdk

```bash
npm install @unrevealed/react
```

```bash
yarn add @unrevealed/react
```

```bash
pnpm install @unrevealed/react
```

2. Add the provider at the root of your app. You can create a client key from your settings

```tsx
import { UnrevealedProvider } from '@unrevealed/react';

function App() {
  return (
    <UnrevealedProvider clientKey={yourClientKey}>
      <MainApp />
    </UnrevealedProvider>
  );
}
```

## Usage

```ts
import { useFeature } from '@unrevealed/react';

function Component() {
  const { enabled, loading } = useFeature('user-access');

  if (loading) {
    // sdk is loading features
  }

  if (enabled) {
    // feature is enabled for the current user
  } else {
    // feature is disabled
  }
}
```
