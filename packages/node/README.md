# Node SDK

The Node SDK helps you integrate Unrevealed in a Node server.

For Node.js in a serverless environment, check the [serverless](/packages/serverless) SDK instead.

## Getting Started

```bash
npm install @unrevealed/node
```

```bash
yarn add @unrevealed/node
```

```bash
pnpm install @unrevealed/node
```

## Usage

### `UnrevealedClient`

The Unrevealed client takes an `UnrevealedClientOptions` object as a parameter:

```ts
const client = new UnrevealedClient({
  apiKey: UNREVEALED_API_KEY,
  logger: customLogger,
  defaults: {
    'feature-a': true,
  },
});
```

| Option     | Type                    | Note                                                                                                              |
| ---------- | ----------------------- | ----------------------------------------------------------------------------------------------------------------- |
| `apiKey`\* | string                  | Generate a `Server` API key on Unrevealed                                                                         |
| `logger`   | UnrevealedLogger        | An optional custom logger (compatible with winston loggers)                                                       |
| `defaults` | Record<string, boolean> | An optional map of default value for your feature flags. Used if the connection gets lost with the Unrevealed API |

#### `connect`

```ts
await client.connect();
```

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
