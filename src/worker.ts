import { defaultSinks, InjectedSinks, LoggerSinks, Worker, Logger, LogLevel, LogMetadata } from '@temporalio/worker';
import { NativeConnection, Runtime, } from '@temporalio/worker'
import * as dotenv from 'dotenv'
import * as defaultActivities from '@/activities/default'
import { pino } from "pino";

/*
import { propagation } from '@opentelemetry/api';
import {
  CompositePropagator,
  W3CBaggagePropagator,
  W3CTraceContextPropagator,
} from '@opentelemetry/core';
import { JaegerPropagator } from '@opentelemetry/propagator-jaeger';
*/

class PinoTemporalLogger implements Logger {
  private logger: pino.Logger;

  constructor() {
    this.logger = pino({
      name: 'worker',
      level: 'debug'
    });
  }

  log(level: LogLevel, message: string, meta?: LogMetadata): any {
    switch (level) {
      case 'DEBUG':
        this.logger.debug(message, meta);
        break;
      case 'TRACE':
        this.logger.trace(message, meta);
        break;
      case 'WARN':
        this.logger.warn(message, meta);
        break;
      case 'ERROR':
        this.logger.error(message, meta);
        break;
      default:
        this.logger.info(message, meta);
    }
  }

  trace(message: string, meta?: LogMetadata): any {
    this.logger.trace(message, meta);
  }

  debug(message: string, meta?: LogMetadata): any {
    this.logger.debug(message, meta);
  }

  info(message: string, meta?: LogMetadata): any {
    this.logger.info(message, meta);
  }

  warn(message: string, meta?: LogMetadata): any {
    this.logger.warn(message, meta);
  }

  error(message: string, meta?: LogMetadata): any {
    this.logger.error(message, meta);
  }

}

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
    },
    logger: new PinoTemporalLogger()
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
