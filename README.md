# Orchestration Workflows

A repository for workflows used in orchestration of services & activities

### Running the worker


#### Install Dependencies

`npm install` to install dependencies.


#### Run the worker

`npm run start.watch` to start the Worker.


### Running the client example

`npm run workflow` In another shell,  to run the Workflow Client.

The Workflow should return:

```bash
Hello, Temporal!
```

## Local Cluster

### Install Temporal local cluster
Install [go](https://go.dev/doc/install) v1.19.3 or later to run local temporal 
```bash
make install-temporalite 
```

### Run Temporal local cluster
```bash
make start-temporalite 
```
At this point you should have a server running on localhost:7233 and a web interface at http://localhost:8233.
