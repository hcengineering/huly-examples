
import { type Request, type Response } from '@hcengineering/rpc'
import { Client, Ref, TxOperations } from '@hcengineering/core'
import clientResources from '@hcengineering/client-resources'
import { setMetadata} from '@hcengineering/platform'
import client from '@hcengineering/client'

import contact, { PersonAccount } from '@hcengineering/contact'
import tracker from '@hcengineering/tracker'

const WebSocket = require('ws')

interface LoginInfo {
  account: string
  front: string
  endpoint: string
  email: string
  token: string | null
  workspace: string
}
const ACCOUNTS_URL = 'http://localhost:8080/account'

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
async function connect (token: LoginInfo): Promise<Client> {
  console.log('setting metadata')
  setMetadata(client.metadata.ClientSocketFactory, (url: string) => {
    return new WebSocket(url)
  })
  const clientRes = await clientResources()
  const getCl = await clientRes.function.GetClient(token.token as any, token.endpoint)
  console.log('getCl:', getCl)
  return getCl
} 

let clientOperations: TxOperations | undefined
function getClientOperations () {
  if (clientOperations === undefined) {
    if (me === undefined || _client instanceof Promise) {
      throw new Error('error during client')
    }
    clientOperations = new TxOperations(_client, me)
    return clientOperations
  }
  return clientOperations
}

let me: Ref<PersonAccount> | undefined
async function main (): Promise<void> {
  const email = 'user1'
  const password = '1234'
  const workspace = 'ws1'
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
  
  me = account._id
  const client = getClientOperations() 

  const test = await client.findAll(tracker.class.Issue, { })
  console.log('findAll result:', test)


  _client.close()
  client.close()
}

main()