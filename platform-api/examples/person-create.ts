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
import contact, { AvatarType, Person } from '@hcengineering/contact'
import { generateId } from '@hcengineering/core'

const url = process.env.HULY_URL ?? 'http://localhost:8087'
const options: ConnectOptions = {
  email: process.env.HULY_URL ?? 'http://localhost:8087',
  password: process.env.HULY_PASSWORD ?? '1234',
  workspace: process.env.HULY_WORKSPACE ?? 'ws1',
  socketFactory: NodeWebSocketFactory,
  connectionTimeout: 30000
}

/**
 * Example demonstrating how to create a person using the Huly Platform API.
 * This script:
 * 1. Creates a person
 * 2. Adds a email address to the person
 */
async function main (): Promise<void> {
  const client = await connect(url, options)

  try {
    const personId = generateId<Person>()

    // Create a person
    await client.createDoc(
      contact.class.Person,
      contact.space.Contacts,
      {
        name: 'Doe,John',
        city: 'New York',
        avatarType: AvatarType.COLOR
      },
      personId
    )

    // Create email address for the person
    await client.addCollection(
      contact.class.Channel,
      contact.space.Contacts,
      personId,
      contact.class.Person,
      'channels',
      {
        provider: contact.channelProvider.Email,
        value: 'john.doe@example.com'
      }
    )

    const person = await client.findOne(contact.class.Person, { _id: personId }) 
    console.log('created person:', person)
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
