# React SDK

Integrate Unrevealed in your front-end applications

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

The first thing you need to do is add the Unrevealed provider at the root of your app. To generate a client key, go to the Api Keys menu in the app and create one. Select Client as the target SDK.

You should use different API keys for different environments.

```tsx
import { UnrevealedProvider } from '@unrevealed/react';

function App() {
  return (
    <UnrevealedProvider clientKey={yourApiKey}>
      <MainApp />
    </UnrevealedProvider>
  );
}
```

**Props**

| Provider Prop | Type   | Note                                               |
| ------------- | ------ | -------------------------------------------------- |
| `clientKey`\* | string | Generate an API key of type `Client` on Unrevealed |

### Identify

You can use the `identify` function returned from the `useIdentify` hook to set the current user and team. Both are optional, but if your logged in user is part of an organization, or is currently in the context of a specific workspace of your app, we highly recommend you pass both.

```tsx
import { useIdentify } from '@unrevealed/react';

function Login() {
  const { identify } = useIdentify();
  // ...

  const login = () => {
    // ...
    identify({
      user: {
        id: user.id,
        traits: {
          email: user.email,
          name: user.name,
          // ...
        },
      },
      team: {
        id: team.id,
        traits: {
          name: team.name,
          plan: team.plan,
          // ...
        },
      },
    });
  };
}
```

### Checking if a feature is enabled

```ts
import { useFeature } from '@unrevealed/react';

function Component() {
  const { enabled, loading } = useFeature('user-access');

  if (loading) {
    // sdk is loading features
    // you don't have to check this every time, but it can be useful if your users experience unwanted flickering in your app
  }

  if (enabled) {
    // feature is enabled for the current user
  } else {
    // feature is disabled
  }
}
```

### Type safety

You can make the `identify` function and `useFeature` hooks type safe by using the [code generator](/docs/code-generation), and defining the traits of your users and teams in the app.

### Feature Toggler Widget

When using Unrevealed in development, you might need to check how the UI responds when a feature is disabled. You can do this without changing the feature's stage in the webapp, or changing your code, by using the Feature Toggler.

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

<figure>
  <img
    src="https://docs.unrevealed.tech/img/docs/sdk/feature-toggler.gif"
    alt="Toggle feature on and off in development"
  />
  <figcaption>Toggle feature on and off in development</figcaption>
</figure>
