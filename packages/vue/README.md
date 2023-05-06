# Vue SDK

Integrate Unrevealed in your front-end Vue applications

## Getting Started

```bash
npm install @unrevealed/vue
```

```bash
yarn add @unrevealed/vue
```

```bash
pnpm install @unrevealed/vue
```

## Usage

### Plugin

Install the Unrevealed plugin to get started. To generate an client api key, go to the Api Keys menu in the app and create one. Select Client as the target SDK.

You should use different api keys for different environments.

```ts
import { UnrevealedPlugin } from '@unrevealed/vue';

app.use(UnrevealedPlugin, { clientKey: yourClientKey });
```

### Identify

You can use the `identify` function returned from `useIdentify` to set the current user and team. Both are optional, but if your logged in user is part of an organization, or is currently in the context of a specific workspace of your app, we highly recommend you pass both.

```vue
<script setup lang="ts">
import { useIdentify } from '@unrevealed/vue';

const { identify } = useIdentify();

// Optional, if you need to load features for logged out users
identify({ user: null });

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
</script>
```

### Checking if a feature is enabled

```vue
<script setup lang="ts">
import { useFeature } from '@unrevealed/vue';

const feature = useFeature('feature-key');
</script>

<template>
  <div v-if="feature.enabled">Feature is enabled</div>
  <div v-else>Feature is disabled</div>
</template>
```

### Type safety

You can make the `identify` and the `useFeature` functions type safe by using the [code generator](/docs/code-generation), and defining the traits of your users and teams in the app.
