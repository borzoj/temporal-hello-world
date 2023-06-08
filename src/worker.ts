import { defaultSinks, InjectedSinks, LoggerSinks, Worker, Logger, LogLevel, LogMetadata } from '@temporalio/worker';
import { NativeConnection, Runtime, } from '@temporalio/worker'
import { Resource } from '@opentelemetry/resources';
import { SemanticResourceAttributes } from '@opentelemetry/semantic-conventions';
import { ConsoleSpanExporter, SimpleSpanProcessor, BatchSpanProcessor } from '@opentelemetry/sdk-trace-base';
import { NodeSDK } from '@opentelemetry/sdk-node';
import { NodeTracerProvider } from '@opentelemetry/sdk-trace-node'
import { ZipkinExporter } from '@opentelemetry/exporter-zipkin'
import {
  OpenTelemetryActivityInboundInterceptor,
  makeWorkflowExporter,
} from '@temporalio/interceptors-opentelemetry/lib/worker'
import * as dotenv from 'dotenv'
import { pino } from "pino"
import * as defaultActivities from '@/activities/default'

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

  const provider = new NodeTracerProvider()

  const resource = new Resource({
    [SemanticResourceAttributes.SERVICE_NAME]: 'hello-world-worker',
  });
  const consoleExporter = new ConsoleSpanExporter();

  const consoleProcessor = new SimpleSpanProcessor(consoleExporter)
  provider.addSpanProcessor(consoleProcessor)
  provider.register()


  const zipkinExporter = new ZipkinExporter({

    url: 'http://localhost:9411/api/v2/spans',
    serviceName: 'hello-world-worker'
  })  
  const zipkinProcessor = new BatchSpanProcessor(zipkinExporter)
  provider.addSpanProcessor(zipkinProcessor)

  const otel = new NodeSDK({ traceExporter: zipkinExporter, resource });
  
  await otel.start();
  

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


  const sinks: InjectedSinks<LoggerSinks> = {
    ...defaultSinks(), 
    exporter: makeWorkflowExporter(zipkinExporter, resource),
  }

  const worker = await Worker.create({
    connection: connection,
    workflowsPath: require.resolve('./workflows'),
    activities: { ...defaultActivities },
    taskQueue: 'default',
    namespace: 'default',
    sinks,
    interceptors: {
      workflowModules: [require.resolve('./workflows')],
      activityInbound: [(ctx) => new OpenTelemetryActivityInboundInterceptor(ctx)],
    },
  })

  worker.run()
}

run().catch((err) => {
  console.error(err)
  process.exit(1)
})
