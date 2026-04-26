import type { Kit } from '../../routes/tinykit/types'
import { pb } from './pocketbase'

const COLLECTION = '_tk_kits'

export interface KitRepository {
	list(): Promise<Kit[]>
	get(id: string): Promise<Kit | null>
	create(params: { name: string; icon?: string }): Promise<Kit>
	update(id: string, data: Partial<Pick<Kit, 'name' | 'icon' | 'builder_theme_id'>>): Promise<Kit>
	delete(id: string): Promise<void>
}

class PocketBaseKitRepository implements KitRepository {
	async list(): Promise<Kit[]> {
		try {
			return await pb.collection(COLLECTION).getFullList<Kit>({
				sort: 'created'
			})
		} catch (e) {
			console.warn('Failed to list kits:', e)
			return []
		}
	}

	async get(id: string): Promise<Kit | null> {
		try {
			return await pb.collection(COLLECTION).getOne<Kit>(id)
		} catch {
			return null
		}
	}

	async create(params: { name: string; icon?: string }): Promise<Kit> {
		try {
			return await pb.collection(COLLECTION).create<Kit>({
				name: params.name,
				icon: params.icon || 'mdi:folder-outline'
			})
		} catch (e: any) {
			const msg = e?.response?.message || e?.message || 'Unknown error'
			console.error('Kit create error:', e?.response || e)
			throw new Error(`Failed to create kit: ${msg}`)
		}
	}

	async update(id: string, data: Partial<Pick<Kit, 'name' | 'icon' | 'builder_theme_id'>>): Promise<Kit> {
		try {
			return await pb.collection(COLLECTION).update<Kit>(id, data)
		} catch (e: any) {
			const msg = e?.response?.message || e?.message || 'Unknown error'
			console.error('Kit update error:', e?.response || e)
			throw new Error(`Failed to update kit: ${msg}`)
		}
	}

	async delete(id: string): Promise<void> {
		await pb.collection(COLLECTION).delete(id)
	}
}

export const kit_repository = new PocketBaseKitRepository()
