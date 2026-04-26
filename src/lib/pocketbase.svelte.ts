export { auth, auth_client } from '$lib/backend/auth.svelte'
export { pb } from '$lib/backend/pocketbase'

// Types for the users collection
export interface User {
	id: string
	email: string
	name: string
	avatar?: string
	created: string
	updated: string
}

// Re-export Project type for convenience
export type { Project, ProjectSettings } from '../routes/tinykit/types'
