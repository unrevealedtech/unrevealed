# Unrevealed Serverless SDK

The serverless SDK help you integrate [Unrevealed](https://unrevealed.tech) in your serverless APIs in Node

## Getting Started

```bash
npm install @unrevealed/serverless
```

```bash
yarn add @unrevealed/serverless
```

```bash
pnpm install @unrevealed/serverless
```

## Usage

### `UnrevealedClient`

The Unrevealed client takes an `UnrevealedClientOptions` object as a parameter:

```ts
const client = new UnrevealedClient({
  apiKey: UNREVEALED_API_KEY,
  fetchMode: 'eager',
});
```

| Option      | Type                 | Note                                                                              | Default |
| ----------- | -------------------- | --------------------------------------------------------------------------------- | ------- |
| `apiKey`\*  | `string`             | Generate a `Serverless` API key on Unrevealed                                     | n/a     |
| `fetchMode` | `'lazy'  \| 'eager'` | Define if the SDK should load rules eagerly on when checking a feature flag first | `lazy`  |

To generate an api key, go to the Api Keys menu in the app and create one with the target `Serverless`.

The client works by first fetching the rules of your features, then it computes whether a feature is enabled locally. When `fetchMode` is `eager`, the client will start loading the rules as soon as it's created. If it's `lazy`, it will only fetch them the first time you call `isFeatureEnabled` or `getEnabledFeatures`.

The API that the client calls to get the rules runs on the edge, so the latency is maximally reduced wherever your code is running.

#### `isFeatureEnabled`

```ts
await client.isFeatureEnabled('feature-key', {
  user: {
    id: 'user-id',
    traits: {
      email: 'john@doe.com',
    },
  },
  team: {
    id: 'team-id',
    traits: {
      name: 'Acme',
    },
  },
});
```

Returns a `Promise<boolean>` that resolves to whether a feature is enabled to a user. If the rules haven't finished loading yet, it first waits for them. Otherwise it simply does the computation locally, without any api calls.

| Parameter      | Type                             | Note                                     |
| -------------- | -------------------------------- | ---------------------------------------- |
| `featureKey`\* | string                           | The key of the feature you want to check |
| `options.user` | `{ id: string, traits: object }` | An optional user                         |
| `options.team` | `{ id: string, traits: object }` | An optional team                         |

#### `getEnabledFeatures`

```ts
await client.getEnabledFeatures({
  user: {
    id: 'user-id',
    traits: {
      email: 'john@doe.com',
    },
  },
  team: {
    id: 'team-id',
    traits: {
      name: 'Acme',
    },
  },
});
```

Returns a `Promise<string[]>` of the feature that are enabled to a user. This also waits for the rules to be done loading.

| Parameter      | Type                             | Note             |
| -------------- | -------------------------------- | ---------------- |
| `options.user` | `{ id: string, traits: object }` | An optional user |
| `options.team` | `{ id: string, traits: object }` | An optional team |

#### identify

```ts
await client.identify({ user: { id: 'user-id', traits: {...} }, team: { id: 'team-id', traits: {...} } });
```

Identifies a user and its current team. This will make the user and its team show up in the Unrevealed app, allowing you to select them for a beta for example.

### Type safety

You can make the `identify`, `isFeatureEnabled` and `getEnabledFeatures` functions type safe by using the [code generator](/packages/cli), and defining the traits of your users and teams in the app.
