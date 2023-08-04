import { Connection, Client } from '@temporalio/client';
import { helloWorld } from '../workflows';
import { nanoid } from 'nanoid';

async function run() {
  const connection = await Connection.connect();

  const client = new Client({
    connection,
    namespace: 'default',
  });
  
  try {
    const address = {
      line1: '113 Kiln Place',
      city: 'London',
      postcode: 'N99 4AD'
    }
    const handle = await client.workflow.start(helloWorld, {
      args: [{
        orderId: '123456',
        address
      }],
      taskQueue: 'default',
      // in practice, use a meaningful business ID, like customerId or transactionId
      workflowId: 'workflow-' + nanoid(),
    });
    console.log(`Started workflow ${handle.workflowId}`);
    console.log(await handle.result()); // Hello, Temporal!
  } catch (err) {
    console.error(err);
  }
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});