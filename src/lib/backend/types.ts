import type { AuthModel } from 'pocketbase'
import type { Template } from '$lib/templates'
import type {
	AgentMessage,
	CollectionSchema,
	ContentField,
	DesignField,
	Project,
	Snapshot
} from '../../routes/tinykit/types'

export type AuthUser = AuthModel

export interface AuthClient {
	readonly user: AuthUser | null
	readonly is_loading: boolean
	readonly error: string | null
	readonly is_authenticated: boolean
	readonly token: string | null
	login(email: string, password: string): Promise<AuthUser>
	register(email: string, password: string, name?: string): Promise<AuthUser>
	logout(): void
	refresh(): Promise<void>
}

export interface CreateProjectParams {
	name: string
	domain?: string
	kit?: string
	frontend_code?: string
	design?: DesignField[]
	content?: ContentField[]
	data?: Record<string, any>
	initial_prompt?: string
}

export interface ProjectRepository {
	list(): Promise<Project[]>
	get(id: string): Promise<Project>
	get_by_domain(domain: string): Promise<Project>
	create(params: CreateProjectParams): Promise<Project>
	batch_create_kit(kit_id: string, templates: Template[]): Promise<Project[]>
	delete_kit(kit_id: string): Promise<void>
	move_to_kit(project_id: string, new_kit: string): Promise<Project>
	rename_kit(old_kit_id: string, new_name: string): Promise<string>
	update(id: string, data: Partial<Project>): Promise<Project>
	delete(id: string): Promise<void>
	update_code(id: string, frontend_code: string): Promise<Project>
	update_design(id: string, design: DesignField[]): Promise<Project>
	update_content(id: string, content: ContentField[]): Promise<Project>
	update_chat(id: string, agent_chat: AgentMessage[]): Promise<Project>
	update_data(id: string, data: Record<string, any>): Promise<Project>
	get_data_file(id: string, filename: string): Promise<any>
	set_data_file(id: string, filename: string, content: any): Promise<Project>
	delete_data_file(id: string, filename: string): Promise<Project>
	create_snapshot(id: string, description: string): Promise<Snapshot>
	restore_snapshot(id: string, snapshot_id: string): Promise<void>
	delete_snapshot(id: string, snapshot_id: string): Promise<void>
	update_settings(id: string, settings: Partial<Project['settings']>): Promise<Project>
}

export interface ProjectRealtimeClient {
	subscribe(
		project_id: string,
		on_update: (project: Project) => void
	): Promise<() => Promise<void>>
}

export interface ProjectAssetClient {
	upload(project_id: string, file: File): Promise<string>
	upload_many(project_id: string, files: File[]): Promise<string[]>
	list(project_id: string): Promise<string[]>
	delete(project_id: string, filename: string): Promise<void>
}

export interface SnapshotData {
	frontend_code: string
	design: DesignField[]
	content: ContentField[]
	collections?: CollectionSchema[]
}
