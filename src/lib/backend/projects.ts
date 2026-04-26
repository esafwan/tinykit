import type { Template } from '$lib/templates'
import type {
	AgentMessage,
	CollectionSchema,
	ContentField,
	DesignField,
	Project,
	Snapshot
} from '../../routes/tinykit/types'
import { pb } from './pocketbase'
import type {
	CreateProjectParams,
	ProjectAssetClient,
	ProjectRealtimeClient,
	ProjectRepository
} from './types'

const COLLECTION = '_tk_projects'

const DEFAULT_PROJECT: Partial<Project> = {
	domain: '',
	kit: 'custom',
	frontend_code: '',
	backend_code: '',
	design: [],
	content: [],
	snapshots: [],
	agent_chat: [],
	custom_instructions: '',
	data: {},
	settings: {
		vibe_zone_enabled: true,
		project_title: ''
	}
}

function sort_projects(items: Project[]): Project[] {
	return items.sort((a, b) => new Date(b.updated).getTime() - new Date(a.updated).getTime())
}

class PocketBaseProjectRepository implements ProjectRepository {
	async list(): Promise<Project[]> {
		const records = await pb.collection(COLLECTION).getList<Project>(1, 500)
		return sort_projects(records.items)
	}

	async get(id: string): Promise<Project> {
		return await pb.collection(COLLECTION).getOne<Project>(id)
	}

	async get_by_domain(domain: string): Promise<Project> {
		return await pb.collection(COLLECTION).getFirstListItem<Project>(`domain = "${domain}"`)
	}

	async create(params: CreateProjectParams): Promise<Project> {
		const project_data: Partial<Project> = {
			...DEFAULT_PROJECT,
			name: params.name,
			domain: params.domain?.toLowerCase() || '',
			kit: params.kit || 'custom',
			frontend_code: params.frontend_code || '',
			design: params.design || [],
			content: params.content || [],
			data: params.data || {},
			settings: {
				...DEFAULT_PROJECT.settings,
				project_title: params.name
			}
		}

		return await pb.collection(COLLECTION).create<Project>(project_data)
	}

	async batch_create_kit(kit_id: string, templates: Template[]): Promise<Project[]> {
		return await Promise.all(
			templates.map((template) => this.create({
				name: template.name,
				kit: kit_id,
				frontend_code: template.frontend_code || '',
				design: template.design || [],
				content: template.content || [],
				data: template.data || {}
			}))
		)
	}

	async delete_kit(kit_id: string): Promise<void> {
		const projects = await this.list()
		const kit_projects = projects.filter((project) => project.kit === kit_id)
		await Promise.all(kit_projects.map((project) => this.delete(project.id)))
	}

	async move_to_kit(project_id: string, new_kit: string): Promise<Project> {
		return this.update(project_id, { kit: new_kit })
	}

	async rename_kit(old_kit_id: string, new_name: string): Promise<string> {
		const projects = await this.list()
		const kit_projects = projects.filter((project) => project.kit === old_kit_id)
		const new_kit_id = `custom:${new_name}`

		await Promise.all(kit_projects.map((project) => this.update(project.id, { kit: new_kit_id })))

		return new_kit_id
	}

	async update(id: string, data: Partial<Project>): Promise<Project> {
		if ('frontend_code' in data) {
			const code_length = (data.frontend_code as string)?.length || 0
			if (code_length === 0) {
				const { frontend_code, ...rest } = data
				if (Object.keys(rest).length > 0) {
					return await pb.collection(COLLECTION).update<Project>(id, rest)
				}

				return await pb.collection(COLLECTION).getOne<Project>(id)
			}
		}

		return await pb.collection(COLLECTION).update<Project>(id, data)
	}

	async delete(id: string): Promise<void> {
		await pb.collection(COLLECTION).delete(id)
	}

	async update_code(id: string, frontend_code: string): Promise<Project> {
		return this.update(id, { frontend_code })
	}

	async update_design(id: string, design: DesignField[]): Promise<Project> {
		return this.update(id, { design })
	}

	async update_content(id: string, content: ContentField[]): Promise<Project> {
		return this.update(id, { content })
	}

	async update_chat(id: string, agent_chat: AgentMessage[]): Promise<Project> {
		return this.update(id, { agent_chat })
	}

	async update_data(id: string, data: Record<string, any>): Promise<Project> {
		return this.update(id, { data })
	}

	async get_data_file(id: string, filename: string): Promise<any> {
		const project = await this.get(id)
		return project.data?.[filename] ?? null
	}

	async set_data_file(id: string, filename: string, content: any): Promise<Project> {
		const project = await this.get(id)
		const data = { ...project.data, [filename]: content }
		return this.update(id, { data })
	}

	async delete_data_file(id: string, filename: string): Promise<Project> {
		const project = await this.get(id)
		const data = { ...project.data }
		delete data[filename]
		return this.update(id, { data })
	}

	async create_snapshot(id: string, description: string): Promise<Snapshot> {
		const project = await this.get(id)
		const snapshots = project.snapshots || []
		const collections: CollectionSchema[] = []

		if (project.data && typeof project.data === 'object') {
			for (const [name, value] of Object.entries(project.data)) {
				if (value && typeof value === 'object' && 'schema' in value) {
					collections.push({
						name,
						schema: (value as any).schema || [],
						records: (value as any).records || []
					})
				}
			}
		}

		const snapshot: Snapshot = {
			id: `snap_${Date.now()}`,
			timestamp: Date.now(),
			description,
			collections
		}

		const snapshot_with_data = {
			...snapshot,
			frontend_code: project.frontend_code || '',
			design: project.design || [],
			content: project.content || []
		}

		const updated_snapshots = [snapshot_with_data, ...snapshots].slice(0, 50)
		await this.update(id, { snapshots: updated_snapshots as any })
		return snapshot
	}

	async restore_snapshot(id: string, snapshot_id: string): Promise<void> {
		const project = await this.get(id)
		const snapshot = (project.snapshots as any[])?.find((item: any) => item.id === snapshot_id)

		if (!snapshot) {
			throw new Error('Snapshot not found')
		}

		await this.create_snapshot(id, 'Before restore')
		const updated_project = await this.get(id)
		const updated_data = { ...updated_project.data }

		if (snapshot.collections && Array.isArray(snapshot.collections)) {
			for (const collection of snapshot.collections) {
				updated_data[collection.name] = {
					schema: collection.schema || [],
					records: collection.records || []
				}
			}
		}

		await this.update(id, {
			frontend_code: snapshot.frontend_code,
			design: snapshot.design,
			content: snapshot.content,
			data: updated_data
		})
	}

	async delete_snapshot(id: string, snapshot_id: string): Promise<void> {
		const project = await this.get(id)
		const snapshots = (project.snapshots || []).filter((snapshot: any) => snapshot.id !== snapshot_id)
		await this.update(id, { snapshots })
	}

	async update_settings(id: string, settings: Partial<Project['settings']>): Promise<Project> {
		const project = await this.get(id)
		return this.update(id, {
			settings: { ...project.settings, ...settings }
		})
	}
}

class PocketBaseProjectRealtimeClient implements ProjectRealtimeClient {
	async subscribe(
		project_id: string,
		on_update: (project: Project) => void
	): Promise<() => Promise<void>> {
		return await pb.collection(COLLECTION).subscribe(project_id, (event) => {
			if (event.action === 'update') {
				on_update(event.record as unknown as Project)
			}
		})
	}
}

class PocketBaseProjectAssetClient implements ProjectAssetClient {
	async upload(project_id: string, file: File): Promise<string> {
		const filenames = await this.upload_many(project_id, [file])
		return filenames[0] || ''
	}

	async upload_many(project_id: string, files: File[]): Promise<string[]> {
		const project = await project_repository.get(project_id)
		const existing_assets = project.assets || []
		const form_data = new FormData()

		for (const file of files) {
			form_data.append('assets+', file)
		}

		const updated = await pb.collection(COLLECTION).update<Project>(project_id, form_data)
		const new_assets = updated.assets || []
		return new_assets.filter((filename) => !existing_assets.includes(filename))
	}

	async list(project_id: string): Promise<string[]> {
		const project = await project_repository.get(project_id)
		return project.assets || []
	}

	async delete(project_id: string, filename: string): Promise<void> {
		await pb.collection(COLLECTION).update(project_id, { 'assets-': filename })
	}
}

export const project_repository = new PocketBaseProjectRepository()
export const project_realtime = new PocketBaseProjectRealtimeClient()
export const project_assets = new PocketBaseProjectAssetClient()
