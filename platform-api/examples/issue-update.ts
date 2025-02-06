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
import { generateId } from '@hcengineering/core'
import tracker, { Milestone, MilestoneStatus } from '@hcengineering/tracker'

const url = process.env.HULY_URL ?? 'http://localhost:8087'
const options: ConnectOptions = {
  email: process.env.HULY_EMAIL ?? 'user1',
  password: process.env.HULY_PASSWORD ?? '1234',
  workspace: process.env.HULY_WORKSPACE ?? 'ws1',
  socketFactory: NodeWebSocketFactory,
  connectionTimeout: 30000
}

/**
 * Example demonstrating how to manage milestones and issues in a project using the Huly Platform API.
 * This script:
 * 1. Creates a new milestone
 * 2. Marks all existing milestones as completed
 * 3. Assigns all open issues to the new milestone
 */
async function main (): Promise<void> {
  const targetDate = Date.now() + 1000 * 60 * 60 * 24 * 14

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

    // Get all existing milestones in the project
    const milestones = await client.findAll(
      tracker.class.Milestone,
      {
        space: project._id
      }
    )

    // Mark all existing milestones as completed
    for (const milestone of milestones) {
      if (milestone.status !== MilestoneStatus.Completed) {
        await client.updateDoc(
          tracker.class.Milestone,
          project._id,
          milestone._id,
          {
            status: MilestoneStatus.Completed
          }
        )
      }
    }

    // Create a new milestone
    const milestoneId = generateId<Milestone>()
    await client.createDoc(
      tracker.class.Milestone,
      project._id,
      {
        label: `Milestone #${milestones.length + 1}`,
        status: MilestoneStatus.InProgress,
        targetDate,
        comments: 0
      },
      milestoneId
    )

    const issues = await client.findAll(tracker.class.Issue, {
      space: project._id,
      status: {
        $nin: [
          tracker.status.Done,
          tracker.status.Canceled
        ]
      }
    })

    // Assign all open issues to the new milestone
    for (const issue of issues) {
      await client.updateDoc(
        tracker.class.Issue,
        project._id,
        issue._id,
        {
          milestone: milestoneId,
          dueDate: targetDate
        }
      )
    }

    console.log('updated issues:', issues.length)
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
