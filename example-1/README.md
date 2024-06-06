# Huly API

This guide will help you understand how to interact with the Huly API for various operations by providing examples of authentication and performing CRUD operations on issues. Whether you're integrating Huly into your application or building a custom client, the examples provided here will help you get started.


## Authentication

### Obtain tokens

Before making requests to the Huly API, you'll need to obtain an authentication token.

#### 1. **Define login credentials**
Define the email, password, and workspace name in the `env` for the workspace you wish to access.

```ts
const email = process.env.EMAIL
const password = process.env.PASSWORD
const workspace = process.env.WORKSPACE
```

#### 2. **Set the account URL**
In the `env`, set the account URL for deployment, stored in the variable `TARGET_DEPLOYMENT`.

```ts
const deployment = process.env.TARGET_DEPLOYMENT
  if (deployment !== undefined) {
    const response = await fetch(deployment + '/config.json')
    const configJson = await response.json()
    ACCOUNTS_URL = configJson.ACCOUNTS_URL
  }
```

#### 3. **Create login request** 
Create a request object with the login method and parameters.

```ts
const request = {
  method: 'login',
  params: [email, password]
}
```

#### 4. **Send login request** 
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

#### **5. Select workspace**
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

#### 2. **Initialize the connection**

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
Once authenticated, you can query all issues accessible to you using the `findAll` method.

```ts
const issues = await client.findAll(tracker.class.Issue, {})
```
### Creating an issue
To create a new issue, determine the issue attributes and pass them into the `addCollection` method:

```ts
const issueToCreate = {
  number: 0,
  title: 'Newly created issue',
  description: '',
  status: taskType.statuses[0], // status from the one of the task types of the Project to be created in
  priority: 0,
  component: null,
  subIssues: 0,
  parents: [],
  estimation: 0,
  remainingTime: 0,
  reportedTime: 0,
  reports: 0,
  childInfo: [],
  kind: taskType._id, // one of the task types of the Project to be created in
  assignee: me.person, // sets assignee to self
  dueDate: null,
  identifier,
  rank: makeRank(lastOne?.rank, undefined) // optional call, used for ordering issues, returns lexorank string
}

return await client.addCollection(
  tracker.class.Issue, // refers to the class of the object to be created
  project._id, 
  tracker.ids.NoParent, // id of the document to be attached to (ex. sub-issue should have parent issue id), if no parent then this id is set
  tracker.class.Issue, // sets the class to which the doc is going to be attached
  'subIssues', // name of the collection
  issueToCreate
)
```

### Updating an issue
Use to `findOne` method to find a specific issue. Then call the `updateDoc` method, passing in the attribute(s) to be updated. 

This example demonstrates removing the assignee from an issue and updating the title to "Removed assignee".

```ts
const issueToUpdate = await client.findOne(tracker.class.Issue, {})

if (issueToUpdate !== undefined) {
  await client.updateDoc(issueToUpdate._class, issueToUpdate.space, issueToUpdate._id, { assignee: null, title: 'Removed assignee' })
  return issueToUpdate._id
}
```

### Removing an issue
To remove (delete) an issue, find the issue by one of its known attributes and use the `removeDoc` method to remove it. 

In this example, the issue with the title "Removed assignee" is removed.

```ts
const issueToRemove = await client.findOne(tracker.class.Issue, { title: 'Removed assignee' })

if (issueToRemove !== undefined) await client.removeDoc(issueToRemove._class, issueToRemove.space, issueToRemove._id)
```

## Support

Need help? Get in touch with our team in our [Huly Community](https://join.slack.com/t/hulycommunity/shared_invite/zt-29kl7zmwz-2b3RRVTiWhhtAwzHjBm3Wg) on Slack.