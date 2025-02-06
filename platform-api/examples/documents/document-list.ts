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

import { ConnectOptions, NodeWebSocketFactory, connect } from '@hcengineering/api-client'
import { SortingOrder } from '@hcengineering/core'
import document from '@hcengineering/document'

const url = process.env.HULY_URL ?? 'http://localhost:8087'
const options: ConnectOptions = {
  email: process.env.HULY_EMAIL ?? 'user1',
  password: process.env.HULY_PASSWORD ?? '1234',
  workspace: process.env.HULY_WORKSPACE ?? 'ws1',
  socketFactory: NodeWebSocketFactory,
  connectionTimeout: 30000
}

/**
 * Example demonstrating how to list documents using the Huly Platform API.
 * This script:
 * 1. Finds a teamspace by name
 * 2. Fetches all documents in the teamspace
*/
async function main (): Promise<void> {
  const client = await connect(url, options)

  try {
    // Find teamspace by name
    const teamspace = await client.findOne(
      document.class.Teamspace,
      {
        name: 'My Documents',
        archived: false
      }
    )

    if (teamspace === undefined) {
      throw new Error('Teamspace not found')
    }
    console.log('teamspace:', teamspace)

    const documents = await client.findAll(
      document.class.Document,
      {
        space: teamspace._id
      },
      {
        limit: 20,
        sort: {
          name: SortingOrder.Ascending
        }
      }
    )

    console.log('documents:', documents.length) 
    for (const doc of documents) {
      console.log('-', doc.title)
      if (doc.content) {
        const markup = await client.fetchMarkup(doc._class, doc._id, 'content', doc.content, 'markdown')
        console.log('  ', markup)
      }
    }
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
