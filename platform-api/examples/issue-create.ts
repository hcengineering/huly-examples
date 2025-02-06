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
import core, { type Ref, SortingOrder, generateId } from '@hcengineering/core'
import { makeRank } from '@hcengineering/rank'
import tracker, { type Issue, IssuePriority } from '@hcengineering/tracker'

const url = process.env.HULY_URL ?? 'http://localhost:8087'
const options: ConnectOptions = {
  email: process.env.HULY_EMAIL ?? 'user1',
  password: process.env.HULY_PASSWORD ?? '1234',
  workspace: process.env.HULY_WORKSPACE ?? 'ws1',
  socketFactory: NodeWebSocketFactory,
  connectionTimeout: 30000
}

/**
 * Example demonstrating how to create an issue in a project using the Huly Platform API.
 * This script:
 * 1. Finds a project by identifier
 * 2. Creates a new issue
 */
async function main (): Promise<void> {
  const client = await connect(url, options)

  try {
    // Find project by identifier
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

    // Generate unique issue Id
    const issueId: Ref<Issue> = generateId()

    // Generate next issue number
    const incResult = await client.updateDoc(
      tracker.class.Project,
      core.space.Space,
      project._id,
      {
        $inc: { sequence: 1 }
      },
      true
    )

    const sequence = (incResult as any).object.sequence

    // Fetch rank of the last issue to insert the issue after
    const lastOne = await client.findOne<Issue>(
      tracker.class.Issue,
      {
        space: project._id
      },
      {
        sort: {
          rank: SortingOrder.Descending
        }
      }
    )

    const description = await client.uploadMarkup(tracker.class.Issue, issueId, 'description', `
# Make coffee

Do morning coffee using drip coffee maker.

* Fill tank with fresh water
* Put 2 scoops ground coffee
* Press start button

Enjoy your coffee.
`, 'markdown')

    // Create issue
    await client.addCollection(
      tracker.class.Issue,
      project._id,
      project._id,
      project._class,
      'issues',
      {
        title: 'Make coffee',
        description,
        status: project.defaultIssueStatus,
        number: sequence,
        kind: tracker.taskTypes.Issue,
        identifier: `${project.identifier}-${sequence}`,
        priority: IssuePriority.Urgent,
        assignee: null,
        component: null,
        estimation: 0,
        remainingTime: 0,
        reportedTime: 0,
        reports: 0,
        subIssues: 0,
        parents: [],
        childInfo: [],
        dueDate: null,
        rank: makeRank(lastOne?.rank, undefined)
      },
      issueId
    )

    const issue = await client.findOne(tracker.class.Issue, { _id: issueId })
    if (issue === undefined) {
      throw new Error('Issue not found')
    }

    console.log('created issue:', issue)
    if (issue.description) {
      const markup = await client.fetchMarkup(issue._class, issue._id, 'description', issue.description, 'markdown') 
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
