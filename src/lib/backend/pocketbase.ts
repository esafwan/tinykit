import PocketBase from 'pocketbase'

export const PB_URL = typeof window !== 'undefined' ? '/_pb' : 'http://127.0.0.1:8091'

export const pb = new PocketBase(PB_URL)

pb.autoCancellation(false)
