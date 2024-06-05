# Huly API

This guide will help you understand how to interact with the Huly API for various operations by providing examples of authentication, querying issues, updating issues, and creating new issues. Whether you're integrating Huly into your application or building a custom client, the examples provided here will help you get started.


## Authentication

### Obtain tokens

Before making requests to the Huly API, you'll need to obtain an authentication token.

#### 1. **Define login credentials**
Define the email, password, and workspace name for the workspace you wish to access.

```ts
const email = 'user1'
const password = '1234'
const workspace = 'ws1'
```

#### 2. **Create login request** 
Create a request object with the login method and parameters.

```ts
const request = {
    method: 'login',
    params: [email, password]
}
```

#### 3. **Send login request** 
Send to the accounts endpoint to obtain the authentication token.

```ts
const response = await fetch(ACCOUNTS_URL, {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json'
    },
    body: JSON.stringify(request)
})

const loginInfo = await sendRequest(request)
```

#### **Select workspace**
Use the obtained token to  select the workspace, allowing you to interact with workspace-specific data.

```ts
const selectWorkspace = {
    method: 'selectWorkspace',
    params: [workspace]
}

const result = await sendRequest(selectWorkspace, loginInfo.token)
```

### Connect to the client

After obtaining the token and selecting the workspace, establish a connection to the Huly client to perform operations.

#### 1. **Set up WebSocket factory** 
Define a factory to create WebSocket connections for the client.

```ts
setMetadata(client.metadata.ClientSocketFactory, (url: string) => {
  return new WebSocket(url)
})
```

#### 2. **Initialize the connection **

Use the token and endpoint obtained during authentication to create a client instance.

```ts
  const connection = await (await clientResources()).function.GetClient(token.token as any, token.endpoint)
```

#### 3. **Retrieve user account** 
Use the client instance to find your account by email and set up client operations.

```ts
const account = await _client.findOne(contact.class.PersonAccount, { email })

const client = new TxOperations(_client, account._id)
```
---

## Example usage

### Querying issues
Once authenticated, you can query all issues accessible to you using the `client.findAll` method:

```ts
const issues = await client.findAll(tracker.class.Issue, {})
```

### Finding and updating a specific issue
To find a specific issue by one of its attributes (for example, `_id`), use the `client.findOne` method and pass in the known attribute. 

Then, use the `client.update` method, passing in the attribute to be changed:

```ts
const issue = await client.findOne(tracker.class.Issue, { _id: ... })
await client.update(issue, { title: 'New Title' }) // new attribute values
```

### Creating a new issue
To create a new issue, determine the issue attributes and pass them into the `client.addCollection` method:

```ts
const issueToCreate: DocData<Issue> = {  
    // Issue attribute data
    ...
}

await client.addCollection(tracker.class.Issue, space, parent, tracker.class.Issue, 'subIssues', issueToCreate)
```