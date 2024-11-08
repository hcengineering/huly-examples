//
// Copyright © 2024 Hardcore Engineering Inc.
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
import { SortingOrder } from '@hcengineering/core'
import tracker from '@hcengineering/tracker'

const url = 'http://localhost:8087'
const email = 'user1'
const password = '1234'
const workspace = 'ws3'
const socketFactory = NodeWebSocketFactory

async function main (): Promise<void> {
  const client = await connect(url, { email, password, workspace, socketFactory })

  try {
    const project = await client.findOne(
      tracker.class.Project,
      {
        identifier: 'HULY'
      }
    )
    if (project === undefined) {
      throw new Error('Project not found')
    }
    console.log('project:', project.identifier, project.description)

    const issues = await client.findAll(
      tracker.class.Issue,
      {
        space: project._id
      },
      {
        limit: 20,
        sort: {
          modifiedOn: SortingOrder.Descending
        }
      }
    )

    console.log('found issues:', issues.length)
    for (const issue of issues) {
      const markup = await client.fetchMarkup(issue._id, 'description', issue.description, 'markdown')
      console.log('-', issue.identifier, issue.title)
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
    })
}
