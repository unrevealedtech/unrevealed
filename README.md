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
      team={teamObject}
      wait={loading}
    >
      <MainApp />
    </UnrevealedProvider>
  );
}
```

**Props**

| Provider Prop | Type    | Note                                                                                                 | Default value |
| ------------- | ------- | ---------------------------------------------------------------------------------------------------- | ------------- |
| `clientKey`\* | string  | Generate the client key on Unrevealed                                                                | N/A           |
| `user`        | Object  | Optional user object                                                                                 | `undefined`   |
| `team`        | Object  | Optional team object                                                                                 | `undefined`   |
| `wait`        | boolean | Set `wait` to `true` if you're still loading the user and want to avoid Unrevealed making 2 requests | `false`       |

**Reserved properties**

The following properties of the `user` object have special meaning to Unrevealed:
`id`: used to uniquely identify a user
`email`, `name`, `firstName`, `lastName`: Unrevealed will make these properties searchable if they are valid strings

The following properties of the `team` object have special meaning to Unrevealed:
`id`: used to uniquely identify a team
`name`: Unrevealed will make this property searchable if it's a valid string

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
