# Huly API

This guide will help you understand how to interact with the Huly API for various operations by providing examples of authentication, querying issues, updating issues, and creating new issues. Whether you're integrating Huly into your application or building a custom client, the examples provided here will help you get started.


### Authentication
Before making requests to the Huly API, you'll need to obtain an authentication token. To authenticate with the Huly API, log in with your email and password to receive a token:

```ts
 const request = {
    method: 'login',
    params: [email, password]
}

const response = await fetch(accountsUrl, {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json'
    },
    body: JSON.stringify(request)
})
const result = await response.json()
```

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