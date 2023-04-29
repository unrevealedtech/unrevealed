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

### Provider

The first thing you need to do is add the Unrevealed provider at the root of your app. To generate an api key, go to the Api Keys menu in the app and create one. Select Client as the target SDK.

You should use different API keys for different environments.

```vue
<script setup>
import { useUnrevealedProvider } from '@unrevealed/vue';

useUnrevealedProvider(yourApiKey);
</script>
```

### Identify

You can use the `identify` function returned from the `useIdentify` hook to set the current user and team. Both are optional, but if your logged in user is part of an organization, or is currently in the context of a specific workspace of your app, we highly recommend you pass both.

```vue
<script setup lang>
import { useIdentify } from '@unrevealed/vue';

const { identify } = useIdentify();

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
  <div v-else="feature.enabled">Feature is diabled</div>
</template>
```

### Type safety

You can make the `identify` and the `useFeature` functions type safe by using the [code generator](/docs/code-generation), and defining the traits of your users and teams in the app.
