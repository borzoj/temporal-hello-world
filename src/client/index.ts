import { Connection, Client } from '@temporalio/client';
import { helloWorld } from '../workflows';
import { nanoid } from 'nanoid';

async function run() {
  const connection = await Connection.connect();

  const client = new Client({
    connection,
    namespace: 'default',
  });
  
  while (true) {
    try {
      let color = 'blue' 
      const rnd = Math.random()
      if (rnd<=0.3) {
        color = 'green'
      } else if (rnd<=0.6) {
        color = 'red'
      }
      const handle = await client.workflow.start(helloWorld, {
        // type inference works! args: [name: string]
        args: [{name:color}],
        taskQueue: 'default',
        // in practice, use a meaningful business ID, like customerId or transactionId
        workflowId: 'workflow-' + nanoid(),
      });
      console.log(`Started workflow ${handle.workflowId}`);
    
      // optional: wait for client result
      console.log(await handle.result()); // Hello, Temporal!
    } catch (err) {
      console.error(err);
    }
  }
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});