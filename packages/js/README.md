# JavaScript SDK

Integrate Unrevealed in your front-end applications

## Getting Started

```bash
npm install @unrevealed/js
```

```bash
yarn add @unrevealed/js
```

```bash
pnpm install @unrevealed/js
```

## Usage

### `UnrevealedClient`

First, create an Unrevealed client by passing your client key. To generate a client key, go to the Api Keys menu in the app and create one. Select Client as the target SDK.

You should use different API keys for different environments.

```ts
import { UnrevealedClient } from '@unrevealed/js';

const client = new UnrevealedClient(yourClientKey);
```

### Subscribe/Unsubscribe

You can subscribe to updates to the enabled features. The `subscribe` method returns a `Symbol` that can be used to `unsubscribe`.

Note that the client isn't receiving updates in real time. These callbacks are simply called when the client has finished fetching features when identifying a user.

```ts
const subscription = client.subscribe(
  (features) => {
    // ...
  },
  (err) => {
    // ...
  },
);

// ...

client.unsubscribe(subscription);
```

### Identify the current user and team

This will fetch the features for the identified user, and save the user and team in Unrevealed.

```ts
client.identify({
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
```

### Checking enabled features

```ts
const { enabled, loading } = client.getFeature('feature-key');

const enabledFeatureKeys = client.getEnabledFeatures();
```

### Type safety

You can make the client type safe regarding feature keys and user/team traits by using the [code generator](/docs/code-generation).
