import { WorkflowClient } from '@temporalio/client'
import { connection } from '../../client_connection'

async function run (): Promise<void> {
  const client = new WorkflowClient({
    connection: await connection,
    namespace: 'diagnostics'
  })

  const handle = await client.start('tdlProcessResult', {
    args: ['test.hl7'],
    taskQueue: 'diagnostics',
    workflowId: 'diagnostics-workflow-tdl-process-result-test.hl7',
    retry: {
      maximumAttempts: 3
    }
  })
  console.log(`Started workflow ${handle.workflowId}`)

  console.log(await handle.result()) // Hello, Temporal!
}

run().catch((err) => {
  console.error(err)
  process.exit(1)
})
