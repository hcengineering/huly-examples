//
// Copyright © 2025 Hardcore Engineering Inc.
//
// Licensed under the Eclipse Public License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License. You may
// obtain a copy of the License at https://www.eclipse.org/legal/epl-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
//
// See the License for the specific language governing permissions and
// limitations under the License.
//

import { NodeWebSocketFactory, connect } from '@hcengineering/api-client'
import core from '@hcengineering/core'
import document from '@hcengineering/document'

const url = process.env.HULY_URL ?? 'http://localhost:8087'
const options = {
  email: process.env.HULY_EMAIL ?? 'user1',
  password: process.env.HULY_PASSWORD ?? '1234',
  workspace: process.env.HULY_WORKSPACE ?? 'ws1',
  socketFactory: NodeWebSocketFactory,
  connectionTimeout: 30000
}

/**
 * Example demonstrating how to create a teamspace using the Huly Platform API.
 * This script:
 * 1. Creates a public teamspace
 * 2. Displays the created teamspace
 */
async function main (): Promise<void> {
  const client = await connect(url, options)

  try {
    const account = client.getAccount()

    // Create a teamspace
    const teamspaceId = await client.createDoc(
      document.class.Teamspace,
      core.space.Space,
      {
        name: 'My Documents',
        description: 'Space for my shared documents',
        private: false,
        archived: false,
        members: [account._id],
        owners: [account._id],
        icon: document.icon.Teamspace,
        type: document.spaceType.DefaultTeamspaceType
      }
    )

    const teamspace = await client.findOne(document.class.Teamspace, { _id: teamspaceId }) 
    console.log('created teamspace:', teamspace) 
  } finally {
    await client.close()
  }
}

if (require.main === module) {
  void main()
    .catch((err) => {
      console.error(err)
      process.exit(1)
    })
}
