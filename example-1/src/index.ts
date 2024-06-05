
import { type Request, type Response } from '@hcengineering/rpc'
import core, { Client, DocData, Ref, SortingOrder, TxOperations } from '@hcengineering/core'
import clientResources from '@hcengineering/client-resources'
import { setMetadata } from '@hcengineering/platform'
import client from '@hcengineering/client'
import { config as dotenvConfig } from 'dotenv'
import contact, { PersonAccount } from '@hcengineering/contact'
import tracker, { Issue } from '@hcengineering/tracker'
import task, { makeRank } from '@hcengineering/task'

const WebSocket = require('ws')
dotenvConfig()

const email = process.env.EMAIL
const password = process.env.PASSWORD
const workspace = process.env.WORKSPACE

interface LoginInfo {
  account: string
  front: string
  endpoint: string
  email: string
  token: string | null
  workspace: string
}
let ACCOUNTS_URL: string
let clientOperations: TxOperations | undefined
let me: PersonAccount | undefined

async function sendRequest(request: any, token?: string): Promise<LoginInfo | undefined> {
  const headers: HeadersInit = {
    'Content-Type': 'application/json'
  }

  if (token !== undefined) {
    headers['Authorization'] = `Bearer ${token}`
  }

  try {
    const response = await fetch(ACCOUNTS_URL, {
      method: 'POST',
      headers,
      body: JSON.stringify(request)
    })
    const result: Response<LoginInfo> = await response.json()
    if (result.error) {
      console.error('result error', result.error.code)
      return
    }
    return result.result
  } catch (err) {
    console.error((err as any).toString())
  }
}
let _client: Client | Promise<Client>
async function connect(token: LoginInfo): Promise<Client> {
  setMetadata(client.metadata.ClientSocketFactory, (url: string) => {
    return new WebSocket(url)
  })
  return await (await clientResources()).function.GetClient(token.token as any, token.endpoint)
}

function getClientOperations() {
  if (clientOperations === undefined) {
    if (me?._id === undefined || _client instanceof Promise) {
      throw new Error('error during client')
    }
    clientOperations = new TxOperations(_client, me._id)
    return clientOperations
  }
  return clientOperations
}


async function createIssue(client: TxOperations): Promise<Ref<Issue> | undefined> {
  const project = await client.findOne(tracker.class.Project, {})
  if (project === undefined) return
  const lastOne = await client.findOne<Issue>(
    tracker.class.Issue,
    { space: project._id },
    { sort: { rank: SortingOrder.Descending } }
  )

  const incResult = await client.updateDoc(
    tracker.class.Project,
    core.space.Space,
    project._id,
    {
      $inc: { sequence: 1 }
    },
    true
  )

  const number = (incResult as any).object.sequence

  const identifier = `${project.identifier}-${number}`

  const taskType = await client.findOne(task.class.TaskType, { parent: project.type })
  if (taskType === undefined) return
  const issueToCreate: DocData<Issue> = {
    number: 0,
    title: 'Newly created issue',
    description: '',
    status: taskType.statuses[0],
    priority: 0,
    component: null,
    subIssues: 0,
    parents: [],
    estimation: 0,
    remainingTime: 0,
    reportedTime: 0,
    reports: 0,
    childInfo: [],
    kind: taskType._id,
    assignee: me?.person ?? null,
    dueDate: null,
    identifier,
    rank: makeRank(lastOne?.rank, undefined)
  }

  return await client.addCollection(tracker.class.Issue, project._id, tracker.ids.NoParent, tracker.class.Issue, 'subIssues', issueToCreate)
}

async function updateIssue(client: TxOperations): Promise<Ref<Issue> | undefined> {
  const issueToUpdate = await client.findOne(tracker.class.Issue, {})
  if (issueToUpdate !== undefined) {
    await client.updateDoc(issueToUpdate._class, issueToUpdate.space, issueToUpdate._id, { assignee: null, title: 'Removed assignee' })
    return issueToUpdate._id
  }
}

async function removeIssue(client: TxOperations): Promise<void> {
  const issueToRemove = await client.findOne(tracker.class.Issue, { title: 'Removed assignee' })
  if (issueToRemove !== undefined) await client.removeDoc(issueToRemove._class, issueToRemove.space, issueToRemove._id)
}

async function main(): Promise<void> {
  const deployment = process.env.TARGET_DEPLOYMENT
  if (deployment !== undefined) {
    const response = await fetch(deployment + '/config.json')
    const configJson = await response.json()
    ACCOUNTS_URL = configJson.ACCOUNTS_URL
  }

  const args = process.argv.slice(2)
  if (email == null || password == null || workspace == null) {
    console.error('Please set .env')
    return
  }
  const request = {
    method: 'login',
    params: [email, password]
  }

  const loginInfo = await sendRequest(request)
  if (loginInfo?.token == null) return

  const selectWorkspace: Request<[string]> = {
    method: 'selectWorkspace',
    params: [workspace]
  }
  const result = await sendRequest(selectWorkspace, loginInfo.token)
  if (result == null) return

  _client = await connect(result)

  const account = await _client.findOne(contact.class.PersonAccount, { email })
  if (account === undefined) {
    console.error('account not found')
    return
  }
  me = account
  const client = getClientOperations()

  if (args[0] === '--create') {
    const createdIssueId = await createIssue(client)
    const issue = await client.findOne(tracker.class.Issue, { _id: createdIssueId })
    console.log('You\'ve created issue: ', issue)
  }

  if (args[0] === '--update') {
    const issueId = await updateIssue(client)
    const updatedIssue = await client.findOne(tracker.class.Issue, { _id: issueId })
    console.log('Updated Issue value', updatedIssue)
  }

  if (args[0] == '--remove') {
    await removeIssue(client)
  }

  _client.close()
  client.close()
}

main()