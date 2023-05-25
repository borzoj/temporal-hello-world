import { Connection } from '@temporalio/client'
import * as dotenv from 'dotenv'
dotenv.config()

export const connection = (async () => await Connection.connect({
  address: process.env.TEMPORAL_GRPC_ADDRESS,
  tls: (process.env.TEMPORAL_GRPC_ADDRESS as string).includes(':443') ? {} : null
}))()
