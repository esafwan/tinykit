/**
 * Project service - client-side project operations.
 *
 * This is now a compatibility facade over the active backend adapter.
 * Today that adapter is PocketBase; later it can be swapped for Frappe.
 */

import { project_repository } from '$lib/backend/projects'
import type {
	Project,
	DesignField,
	ContentField,
	Snapshot,
	AgentMessage
} from '../../routes/tinykit/types'
import type { Template } from '$lib/templates'

/**
 * Project service with all CRUD operations
 */
export const project_service = {
	/**
	 * List all projects (sorted by updated date, newest first)
	 */
	async list(): Promise<Project[]> {
		return await project_repository.list()
	},

	/**
	 * Get a single project by ID
	 */
	async get(id: string): Promise<Project> {
		return await project_repository.get(id)
	},

	/**
	 * Create a new project
	 */
	async create(params: {
		name: string
		domain?: string
		kit?: string
		frontend_code?: string
		design?: DesignField[]
		content?: ContentField[]
		data?: Record<string, any>
		initial_prompt?: string
	}): Promise<Project> {
		return await project_repository.create(params)
	},

	/**
	 * Batch create all projects for a kit
	 */
	async batch_create_kit(kit_id: string, templates: Template[]): Promise<Project[]> {
		return await project_repository.batch_create_kit(kit_id, templates)
	},

	/**
	 * Delete all projects in a kit
	 */
	async delete_kit(kit_id: string): Promise<void> {
		await project_repository.delete_kit(kit_id)
	},

	/**
	 * Move a project to a different kit
	 */
	async move_to_kit(project_id: string, new_kit: string): Promise<Project> {
		return await project_repository.move_to_kit(project_id, new_kit)
	},

	/**
	 * Rename a kit by updating all projects to use a new kit ID
	 * Returns the new kit ID
	 */
	async rename_kit(old_kit_id: string, new_name: string): Promise<string> {
		return await project_repository.rename_kit(old_kit_id, new_name)
	},

	/**
	 * Update a project
	 */
	async update(id: string, data: Partial<Project>): Promise<Project> {
		return await project_repository.update(id, data)
	},

	/**
	 * Delete a project
	 */
	async delete(id: string): Promise<void> {
		await project_repository.delete(id)
	},

	// ==========================================
	// Convenience methods for specific fields
	// ==========================================

	/**
	 * Update frontend code
	 */
	async update_code(id: string, frontend_code: string): Promise<Project> {
		return await project_repository.update_code(id, frontend_code)
	},

	/**
	 * Update design fields
	 */
	async update_design(id: string, design: DesignField[]): Promise<Project> {
		return await project_repository.update_design(id, design)
	},

	/**
	 * Update content fields
	 */
	async update_content(id: string, content: ContentField[]): Promise<Project> {
		return await project_repository.update_content(id, content)
	},

	/**
	 * Update agent chat history
	 */
	async update_chat(id: string, agent_chat: AgentMessage[]): Promise<Project> {
		return await project_repository.update_chat(id, agent_chat)
	},

	/**
	 * Update data (JSON key-value store)
	 */
	async update_data(id: string, data: Record<string, any>): Promise<Project> {
		return await project_repository.update_data(id, data)
	},

	/**
	 * Get a specific data file from project.data
	 */
	async get_data_file(id: string, filename: string): Promise<any> {
		return await project_repository.get_data_file(id, filename)
	},

	/**
	 * Set a specific data file in project.data
	 */
	async set_data_file(id: string, filename: string, content: any): Promise<Project> {
		return await project_repository.set_data_file(id, filename, content)
	},

	/**
	 * Delete a specific data file from project.data
	 */
	async delete_data_file(id: string, filename: string): Promise<Project> {
		return await project_repository.delete_data_file(id, filename)
	},

	// ==========================================
	// Snapshot operations
	// ==========================================

	/**
	 * Create a snapshot of current project state
	 */
	async create_snapshot(id: string, description: string): Promise<Snapshot> {
		return await project_repository.create_snapshot(id, description)
	},

	/**
	 * Restore a snapshot
	 */
	async restore_snapshot(id: string, snapshot_id: string): Promise<void> {
		await project_repository.restore_snapshot(id, snapshot_id)
	},

	/**
	 * Delete a snapshot
	 */
	async delete_snapshot(id: string, snapshot_id: string): Promise<void> {
		await project_repository.delete_snapshot(id, snapshot_id)
	},

	// ==========================================
	// Settings operations
	// ==========================================

	/**
	 * Update project settings
	 */
	async update_settings(
		id: string,
		settings: Partial<Project['settings']>
	): Promise<Project> {
		return await project_repository.update_settings(id, settings)
	}
}
