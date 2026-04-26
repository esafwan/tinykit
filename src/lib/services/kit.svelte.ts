/**
 * Kit service - client-side kit operations.
 *
 * This is a compatibility facade over the active backend adapter.
 */

import { kit_repository } from '$lib/backend'
import type { Kit } from '../../routes/tinykit/types'

/**
 * Kit service with all CRUD operations
 */
export const kit_service = {
	/**
	 * List all kits (sorted by created date, oldest first)
	 */
	async list(): Promise<Kit[]> {
		return await kit_repository.list()
	},

	/**
	 * Get a single kit by ID
	 */
	async get(id: string): Promise<Kit | null> {
		return await kit_repository.get(id)
	},

	/**
	 * Create a new kit
	 */
	async create(params: { name: string; icon?: string }): Promise<Kit> {
		return await kit_repository.create(params)
	},

	/**
	 * Update a kit
	 */
	async update(id: string, data: Partial<Pick<Kit, 'name' | 'icon' | 'builder_theme_id'>>): Promise<Kit> {
		return await kit_repository.update(id, data)
	},

	/**
	 * Delete a kit
	 */
	async delete(id: string): Promise<void> {
		await kit_repository.delete(id)
	}
}
