import type { Project } from '../../routes/tinykit/types'
import type { LLMSettings } from '$lib/server/pb'
import {
	addContentField,
	addDataCollection,
	addDesignField,
	createProject,
	createSnapshot,
	deleteProject,
	deleteSnapshot,
	ensureAuth,
	getAvailableDomains,
	getLLMSettings,
	getProject,
	getProjectByDomain,
	isSetupComplete,
	listProjects,
	removeAvailableDomain,
	restoreSnapshot,
	trackAvailableDomain,
	unauthorizedResponse,
	updateProject,
	validateUserToken
} from '$lib/server/pb'

export interface ServerBackend {
	ensure_auth(): Promise<boolean>
	is_setup_complete(): Promise<boolean>
	list_projects(): Promise<Project[]>
	get_project(id: string): Promise<Project | null>
	get_project_by_domain(domain: string): Promise<Project | null>
	create_project(data: {
		name: string
		domain?: string
		kit?: string
		frontend_code?: string
		design?: any[]
		content?: any[]
		initial_prompt?: string
	}): Promise<Project | null>
	update_project(project_id: string, data: any): Promise<Project | null>
	delete_project(project_id: string): Promise<boolean>
	create_snapshot(project_id: string, description: string, tools?: string[]): Promise<any>
	restore_snapshot(project_id: string, snapshot_id: string): Promise<any>
	delete_snapshot(project_id: string, snapshot_id: string): Promise<void>
	add_content_field(project_id: string, field: { name: string; type: string; value: any; description?: string }): Promise<any>
	add_design_field(project_id: string, field: { name: string; css_var: string; type: string; value: string; description?: string }): Promise<any>
	add_data_collection(project_id: string, collection: { filename: string; schema: Array<{ name: string; type: string }>; records: any[]; icon?: string }): Promise<any>
	get_llm_settings(): Promise<LLMSettings | null>
	validate_user_token(request: Request): Promise<{ id: string; email: string } | null>
	track_available_domain(hostname: string): Promise<void>
	get_available_domains(): Promise<Array<{ hostname: string; first_seen: string; last_seen: string }>>
	remove_available_domain(hostname: string): Promise<void>
	save_published_html(project_id: string, html: string): Promise<Project | null>
	unauthorized_response(message?: string): Response
}

export const server_backend: ServerBackend = {
	ensure_auth: ensureAuth,
	is_setup_complete: isSetupComplete,
	list_projects: listProjects,
	get_project: getProject,
	get_project_by_domain: getProjectByDomain,
	create_project: createProject,
	update_project: updateProject,
	delete_project: deleteProject,
	create_snapshot: createSnapshot,
	restore_snapshot: restoreSnapshot,
	delete_snapshot: deleteSnapshot,
	add_content_field: addContentField,
	add_design_field: addDesignField,
	add_data_collection: addDataCollection,
	get_llm_settings: getLLMSettings,
	validate_user_token: validateUserToken,
	track_available_domain: trackAvailableDomain,
	get_available_domains: getAvailableDomains,
	remove_available_domain: removeAvailableDomain,
	async save_published_html(project_id: string, html: string) {
		const form_data = new FormData()
		const blob = new Blob([html], { type: 'text/html' })
		form_data.append('published_html', blob, 'index.html')
		return updateProject(project_id, form_data)
	},
	unauthorized_response: unauthorizedResponse
}
