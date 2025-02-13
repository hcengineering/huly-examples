
import { ConnectOptions, NodeWebSocketFactory, connect } from '@hcengineering/api-client'
import contact, { AvatarType, Person } from '@hcengineering/contact'
import { generateId } from '@hcengineering/core'

const url = process.env.HULY_URL ?? 'http://localhost:8087'
const options: ConnectOptions = {
    email: process.env.HULY_EMAIL ?? 'user1',
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
 * 3. Adds an employee mixin to the person
 */

async function main(): Promise<void> {
    const client = await connect(url, options);

    try {
        const personId = generateId<Person>();

        // Create a person first (employee extends person)
        await client.createDoc(
            contact.class.Person,
            contact.space.Contacts,
            {
                name: 'Doe,John',
                city: 'New York',
                avatarType: AvatarType.COLOR,
            },
            personId
        );

        // Add email channel
        await client.addCollection(
            contact.class.Channel,
            contact.space.Contacts,
            personId,
            contact.class.Person,
            "channels",
            {
                provider: contact.channelProvider.Email,
                value: 'john.doe@example.com',
            }
        );

        // Add employee mixin with position
        await client.createMixin(
            personId,
            contact.class.Person,
            contact.space.Contacts,
            contact.mixin.Employee,
            {
                active: true,
                position: "Developer"
            }
        );

        const employee = await client.findOne(contact.class.Person, {
            _id: personId,
        });
    } finally {
        await client.close();
    }
}


if (require.main === module) {
    void main()
        .catch((err) => {
            console.error(err)
            process.exit(1)
        })
}
