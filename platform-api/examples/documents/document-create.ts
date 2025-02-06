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
import { Ref, SortingOrder, generateId } from '@hcengineering/core'
import document, { Document } from '@hcengineering/document'
import { makeRank } from '@hcengineering/rank'

const url = process.env.HULY_URL ?? 'http://localhost:8087'
const options: ConnectOptions = {
  email: process.env.HULY_EMAIL ?? 'user1',
  password: process.env.HULY_PASSWORD ?? '1234',
  workspace: process.env.HULY_WORKSPACE ?? 'ws1',
  socketFactory: NodeWebSocketFactory,
  connectionTimeout: 30000
}

/**
 * Example demonstrating how to create a document using the Huly Platform API.
 * This script:
 * 1. Finds a teamspace by name
 * 2. Creates a document in the teamspace
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

    // Fetch rank of the last document to insert after
    const lastOne = await client.findOne<Document>(
      document.class.Document,
      {
        space: teamspace._id
      },
      {
        sort: {
          rank: SortingOrder.Descending
        }
      }
    )

    // Generate unique issue Id
    const documentId: Ref<Document> = generateId()
    const content = await client.uploadMarkup(document.class.Document, documentId, 'content', `
      # Make coffee
      
      Do morning coffee using drip coffee maker.
      
      * Fill tank with fresh water
      * Put 2 scoops ground coffee
      * Press start button
      
      Enjoy your coffee.
      `, 'markdown')

    await client.createDoc(
      document.class.Document,
      teamspace._id,
      {
        title: 'Make coffee',
        content,
        parent: document.ids.NoParent,
        rank: makeRank(lastOne?.rank, undefined)
      },
      documentId
    )

    const doc = await client.findOne(document.class.Document, { _id: documentId })
    if (doc === undefined) {
      throw new Error('Document not found')
    }

    console.log('created document:', doc)
    if (doc.content) {
      const markup = await client.fetchMarkup(doc._class, doc._id, 'content', doc.content, 'markdown') 
      console.log(markup)
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
