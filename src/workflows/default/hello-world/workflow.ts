
import { LoggerSinks, proxyActivities, proxySinks } from '@temporalio/workflow'
import type * as activities from '../../../activities/default'


export const ActivityOptions = {
  startToCloseTimeout: '1 minute',
  retry: {
    maximumAttempts: 3,
    initialInterval: 500,
    maximumInterval: 18000, 
    backoffCoefficient: 2,
    nonRetryableErrorTypes: []
  }
}

const { hello, world } = proxyActivities<typeof activities>(ActivityOptions)

const { defaultWorkerLogger } = proxySinks<LoggerSinks>();

type HelloArgs = {
  name: string;
};

export async function helloWorld (args:HelloArgs): Promise<string> {
  defaultWorkerLogger.info('hello world start', {})
  const helloResult = await hello(args.name)
  defaultWorkerLogger.info('hello world middle', {})
  const worldResult = await world(helloResult)
  defaultWorkerLogger.info('hello world finish', {})
  return worldResult
}
