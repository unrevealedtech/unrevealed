# Unrevealed Serverless SDK

The serverless SDK helps you integrate [Unrevealed](https://unrevealed.tech) in your serverless applications written in Node.js

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

To generate an api key, go to the Api Keys menu in the app and create one with the target `Serverless`. This is important as `Serverless` api keys have different permissions from `Client` and `Server` ones.

The api key determines which environment you're in, so make sure you use a different one for each of them.

The client works by first fetching the rules of your features. It then computes whether a feature is enabled or not locally. When `fetchMode` is `eager`, the client will start loading the rules as soon as it's created. If it's `lazy`, it will only fetch them the first time you call `isFeatureEnabled` or `getEnabledFeatures`.

The API that the client calls to get the rules runs on the edge, so the latency is minimal wherever your code is running.

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

Returns a `Promise<boolean>` that resolves to whether a feature is enabled to a user. If the rules haven't finished loading yet, it first waits for them. Otherwise, it simply does the computation locally, without any new api call.

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

Returns a `Promise<string[]>` of the feature that are enabled to a user. It also waits for the rules to be done loading.

| Parameter      | Type                             | Note             |
| -------------- | -------------------------------- | ---------------- |
| `options.user` | `{ id: string, traits: object }` | An optional user |
| `options.team` | `{ id: string, traits: object }` | An optional team |

#### `getFeatureAccess`

```ts
await client.getFeatureAccess('feature-key');
```

Returns a `Promise<FeatureAccess>` that resolves the current access rules for the given feature:

```ts
interface FeatureAccess {
  fullAccess: boolean;
  userAccess: string[];
  teamAccess: string[];
  userPercentageAccess: number;
  teamPercentageAccess: number;
}
```

- `fullAccess` is `true` if the feature is enabled for every user
- `userAccess` is a list of user ids who have access to the feature
- `teamAccess` is a list of team ids who have access to the feature
- `userPercentageAccess` is a the percentage of users who have access to the feature if relevant
- `teamPercentageAccess` is a the percentage of teams who have access to the feature if relevant

Percentages are numbers between `0` and `100` and will be `0` if no progressive rollout is in use for the given feature.

#### identify

```ts
await client.identify({ user: { id: 'user-id', traits: {...} }, team: { id: 'team-id', traits: {...} } });
```

Identifies a user and its current team. This will make the user and its team show up in the Unrevealed app, allowing you to select them for a beta for example.

### Type safety

You can make the `identify`, `isFeatureEnabled` and `getEnabledFeatures` functions type safe by using the [code generator](/packages/cli), and defining the traits of your users and teams in the app.
