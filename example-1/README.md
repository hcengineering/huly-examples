Get the token
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


Query all accessible to you issues
```ts
const issues = await client.findAll(tracker.class.Issue, {})
```

Find specific issue with set attribute (_id for example) and update it
```ts
const issue = await client.findOne(tracker.class.Issue, { _id: ... })
await client.update(issue, { titile: 'New Title' }) // new attribute values
```


Create new Issue
```ts
const issueToCreate: DocData<Issue> = {  // Issue attribitesdata
    ...
}

await client.addCollection(tracker.class.Issue, space, parent, tracker.class.Issue, 'subIssues', issueToCreate)
```