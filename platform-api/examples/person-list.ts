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
import contact from '@hcengineering/contact'

const url = process.env.HULY_URL ?? 'http://localhost:8087'
const options: ConnectOptions = {
  email: process.env.HULY_URL ?? 'http://localhost:8087',
  password: process.env.HULY_PASSWORD ?? '1234',
  workspace: process.env.HULY_WORKSPACE ?? 'ws1',
  socketFactory: NodeWebSocketFactory,
  connectionTimeout: 30000
}

/**
 * Example demonstrating how to querypersons using the Huly Platform API.
 * This script:
 * 1. Finds all persons
 * 2. Prints the persons and their contact channels
 */
async function main (): Promise<void> {
  const client = await connect(url, options)

  try {
    const persons = await client.findAll(contact.class.Person, {})

    console.log('found persons:', persons.length)
    for (const person of persons) {
      const channels = await client.findAll(
        contact.class.Channel, {
          attachedTo: person._id,
          attachedToClass: person._class
        }
      )

      console.log('-', person.name, person.city)
      for (const channel of channels) {
        console.log('  -', channel.value)
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
