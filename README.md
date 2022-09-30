# React SDK for Unrevealed

React sdk for [Unrevealed](https://unrevealed.tech/).

## Getting Started

```bash
npm install @unrevealed/react
```

```bash
yarn add @unrevealed/react
```

```bash
pnpm install @unrevealed/react
```

## Usage

### Provider

Add the provider at the root of your app. You can create a client key from your settings

```tsx
import { UnrevealedProvider } from '@unrevealed/react';

function App() {
  return (
    <UnrevealedProvider
      clientKey={yourClientKey}
      user={userObject}
      wait={loading}
    >
      <MainApp />
    </UnrevealedProvider>
  );
}
```

| Provider Prop | Type    | Note                                                                                                             | Default value |
| ------------- | ------- | ---------------------------------------------------------------------------------------------------------------- | ------------- |
| `clientKey`\* | string  | Generate the client key on Unrevealed                                                                            | N/A           |
| `user`        | Object  | Optional user object if you have user targetting on your features. The object should have a unique `id` property | `undefined`   |
| `wait`        | boolean | Set `wait` to `true` if you're still loading the user and want to avoid Unrevealed making 2 requests             | `false`       |

### Checking if a feature is enabled

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

- `loading` will be set to `true` while Unrevealed is fetching the enabled feature flags

### Feature Toggler Widget

When using Unrevealed in development, you might need to see what your UI looks like when a feature is disabled. To avoid having to change your feature's state in the webapp, you can drop the feature toggler in your app.

```tsx
import { UnrevealedProvider, FeatureToggler } from '@unrevealed/react';

function App() {
  return (
    <UnrevealedProvider clientKey={yourClientKey}>
      {process.env.NODE_ENV === 'development' && <FeatureToggler />}
      <MainApp />
    </UnrevealedProvider>
  );
}
```
