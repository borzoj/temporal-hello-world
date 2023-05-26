# Hello World Workflow

A simple Temporal workflow and client for use with [https://github.com/borzoj/temporal-docker-compose](https://github.com/borzoj/temporal-docker-compose). 

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

## Prometheus Metrics

The worked is comfigured to emit Promoetheus metrics. You can verify the metrics are available by checking this URL while the worker is running: [http://localhost:9464](http://localhost:9464)