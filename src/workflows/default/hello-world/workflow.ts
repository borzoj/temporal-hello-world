import { LoggerSinks, proxyActivities, proxySinks, sleep, WorkflowInterceptorsFactory } from '@temporalio/workflow'
import { ActivityFailure, ApplicationFailure } from '@temporalio/common'
import { RoyalMailRequestError } from '../../../activities/default'
import {
  OpenTelemetryInboundInterceptor,
  OpenTelemetryOutboundInterceptor,
} from '@temporalio/interceptors-opentelemetry/lib/workflow'
import type * as activities from '../../../activities/default'
import { Address } from  '../../../activities/default'

export const ActivityOptions = {
  startToCloseTimeout: '1 minute',
  retry: {
    maximumAttempts: 5,
    initialInterval: 1000,
    maximumInterval: 300000, 
    backoffCoefficient: 2,
    nonRetryableErrorTypes: ['RoyalMailRequestError']
  }
}

const { createLabel, uploadToNextcloud, markAsNeedsAttention, markAsFailed } = proxyActivities<typeof activities>(ActivityOptions)

const { defaultWorkerLogger } = proxySinks<LoggerSinks>();
const logger = defaultWorkerLogger

type HelloArgs = {
  orderId: string,
  address: Address
};

export async function helloWorld (args:HelloArgs): Promise<string> {
  logger.info('hello world start', {})
  let error
  let result
  try {
    result = await createLabel(args.address)
    logger.info('label creation success result' + result, {})
  } catch (e) {
    if (e instanceof ActivityFailure && 
      e?.cause instanceof ApplicationFailure &&
      e.cause?.type === 'RoyalMailRequestError') {
      error = e.cause 
    } else {
      throw e
    }
  }
  if (result !== undefined) {
    logger.info("label created successfully", {})
    return await uploadToNextcloud(args.orderId)
  } 
  logger.info("label failed to create, handling gracefuly", {})
  await markAsNeedsAttention(args.orderId)
  await sleep(10*1000)
  await markAsFailed(args.orderId)
  return "failed"
}

export const interceptors: WorkflowInterceptorsFactory = () => ({
  inbound: [new OpenTelemetryInboundInterceptor()],
  outbound: [new OpenTelemetryOutboundInterceptor()],
})