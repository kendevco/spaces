import config from '@payload-config'
import { getPayload } from 'payload'

// This is a server-only utility for accessing Payload's Local API
export const getPayloadClient = async () => {
  const payload = await getPayload({
    config,
  })
  return payload
}
