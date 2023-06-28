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

#### `fetchRules`

```ts
await client.fetchRules();
```

Fetch the rules they were not already loaded

Call this once when initializing your server. The SDK will open a connection to our servers that will receive the rules for your feature flags, and real-time updates when any of those rules change. Rules are stored and evaluated locally, so evaluating feature flags is fast and synchronous.

#### `close`

```ts
client.close();
```

Closes the connection with the Unrevealed API.

#### `isFeatureEnabled`

```ts
client.isFeatureEnabled('feature-b', { user: { id: 'user-id', traits: {...} }, team: { id: 'team-id', traits: {...} } });
```

Returns `true` if a feature is enabled for a certain user in a certain team, `false` otherwise.

| Parameter      | Type                             | Note                                     |
| -------------- | -------------------------------- | ---------------------------------------- |
| `featureKey`\* | string                           | The key of the feature you want to check |
| `options.user` | `{ id: string, traits: object }` | An optional user                         |
| `options.team` | `{ id: string, traits: object }` | An optional team                         |

#### `getEnabledFeatures`

```ts
client.getEnabledFeatures({ user: { id: 'user-id', traits: {...} }, team: { id: 'team-id', traits: {...} } });
```

Returns an array of the keys of all the features enabled for a certain user in a certain team.

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

You can make the `identify` and `isFeatureEnabled` functions type safe by using the [code generator](/packages/cli), and defining the traits of your users and teams in the app.
