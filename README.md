# Huly API

This guide will help you understand how to interact with the Huly API for various operations by providing examples of authentication and performing CRUD operations on issues. Whether you're integrating Huly into your application or building a custom client, the examples provided here will help you get started.

## Running the examples

To run the examples, you will need to have Huly running locally or have workspace on the [Huly Cloud](https://huly.app).

```bash
npm install
npx ts-node examples/issue-list.ts
```

## Installing packages

In order to be able to install required packages, you will need to obtain GitHub access token. You can create a token by following the instructions [here](https://docs.github.com/en/packages/working-with-a-github-packages-registry/working-with-the-npm-registry#authenticating-with-a-personal-access-token).

## Authentication

There are two ways to connect to the platform.

### Using Email and Password

```ts
const client = await connect('http://localhost:8087', {
  email: 'user1',
  password: '1234',
  workspace: 'ws1'
})

...

await client.close()
```

### Using Token

```ts
const client = await connect('http://localhost:8087', {
  token: '...',
  workspace: 'ws1'
})

...

await client.close()
```

## Example usage

You can find usage examples in the `examples` directory.

### Querying issues

Code example demonstrating how to query issues in specific project. Location: `issue-list.ts`

### Creating an issue

Code example demonstrating how to create an issue. Location: `issue-create.ts`

## Support

Need help? Get in touch with our team in our [Huly Community](https://huly.link/slack) on Slack.
