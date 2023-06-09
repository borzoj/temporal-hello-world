# Hello World Workflow

A simple Temporal workflow and client for use with [Temporal Server with Docker Compose](https://github.com/borzoj/temporal-docker-compose). 

## How to Use

### Clone and Install Dependencies

```bash
git clone git@github.com:borzoj/temporal-hello-world.git
cd  temporal-hello-world
npm install
```

### Run the Worker

```bash
npm run build
npm run start
```


### Run the Client 

```bash
ts-node ./src/client/index.ts
```

## What's included

### Workflow and Activites

This project contains a single workflow and two activites. They concatenate strings to produce `Hello {colour} World`, where `colour` is an argument passed to the workflow. Depending on the colour the workflow will succeed, or one of the activites will fail. The purpose of this is to deonstrate success and exception monitoring for activites and workflows.

### Prometheus Metrics

The worker is configured to emit Promoetheus metrics. You can verify the metrics are available by checking this URL while the worker is running: [http://localhost:9464](http://localhost:9464). Prometheus and Grafana are included in the server.

### OpenTelemetry Export to Zipkin

The worker is configured to push OpenTelemetry traces to Zipkin running at [http://localhost:9411](http://localhost:9411). Zipkin is included in the server.

### JSON Logging with pino

The worker is uses [pino](https://github.com/pinojs/pino) for logging. Default JSON formatting with pino is better for log ingestion into CloudWatch. There is also code showing how logging can be done from acrtivities and workflows but this uses simple `console.log` for now.
