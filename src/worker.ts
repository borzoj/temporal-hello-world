import { defaultSinks, InjectedSinks, LoggerSinks, Worker } from '@temporalio/worker';
import { NativeConnection, Runtime } from '@temporalio/worker'
import * as dotenv from 'dotenv'
import * as defaultActivities from '@/activities/default'
/*
import { propagation } from '@opentelemetry/api';
import {
  CompositePropagator,
  W3CBaggagePropagator,
  W3CTraceContextPropagator,
} from '@opentelemetry/core';
import { JaegerPropagator } from '@opentelemetry/propagator-jaeger';
*/

dotenv.config()

const run = async (): Promise<void> => {
  /*
  propagation.setGlobalPropagator(
    new CompositePropagator({
    propagators: [
      new W3CTraceContextPropagator(),
      new W3CBaggagePropagator(),
      new JaegerPropagator(),
    ],
    })
  );
  */
  
  //this exposes metrics for Prometheus scraping
  await Runtime.install({
    telemetryOptions: {
      metrics: {
        prometheus: { bindAddress: '0.0.0.0:9464' },
      },
      logging: { 
        forward: { level: 'DEBUG' } 
      }
    }
  })

  const connection: NativeConnection = await NativeConnection.connect({
    address: process.env.TEMPORAL_GRPC_ADDRESS,
    tls: (process.env.TEMPORAL_GRPC_ADDRESS as string).includes(':443') ? {} : null
  })


  const sinks: InjectedSinks<LoggerSinks> = defaultSinks()

  const worker = await Worker.create({
    connection: connection,
    workflowsPath: require.resolve('./workflows'),
    activities: { ...defaultActivities },
    taskQueue: 'default',
    namespace: 'default',
    sinks
  })

  worker.run()
}

run().catch((err) => {
  console.error(err)
  process.exit(1)
})
