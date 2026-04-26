import type { AuthModel } from 'pocketbase'
import { pb } from './pocketbase'
import type { AuthClient } from './types'

class PocketBaseAuthClient implements AuthClient {
	user = $state<AuthModel | null>(null)
	is_loading = $state(true)
	error = $state<string | null>(null)

	constructor() {
		if (typeof window !== 'undefined') {
			this.user = pb.authStore.model

			pb.authStore.onChange((_token, model) => {
				this.user = model
			})

			if (pb.authStore.isValid && pb.authStore.model) {
				pb.collection('users').authRefresh()
					.then((auth_data) => {
						this.user = auth_data.record
						this.is_loading = false
					})
					.catch(() => {
						console.warn('[Auth] Token invalid, clearing auth')
						pb.authStore.clear()
						this.user = null
						this.is_loading = false
					})
			} else {
				this.is_loading = false
			}
		} else {
			this.is_loading = false
		}
	}

	get is_authenticated(): boolean {
		return pb.authStore.isValid && !!this.user
	}

	get token(): string | null {
		return pb.authStore.token
	}

	async login(email: string, password: string): Promise<AuthModel> {
		this.error = null
		this.is_loading = true

		try {
			const auth_data = await pb.collection('users').authWithPassword(email, password)
			this.user = auth_data.record
			return auth_data.record
		} catch (err: any) {
			this.error = err.message || 'Login failed'
			throw err
		} finally {
			this.is_loading = false
		}
	}

	async register(email: string, password: string, name?: string): Promise<AuthModel> {
		this.error = null
		this.is_loading = true

		try {
			await pb.collection('users').create({
				email,
				password,
				passwordConfirm: password,
				name: name || email.split('@')[0]
			})

			return await this.login(email, password)
		} catch (err: any) {
			this.error = err.message || 'Registration failed'
			throw err
		} finally {
			this.is_loading = false
		}
	}

	logout(): void {
		pb.authStore.clear()
		this.user = null
		this.error = null
	}

	async refresh(): Promise<void> {
		if (!pb.authStore.isValid) return

		try {
			const auth_data = await pb.collection('users').authRefresh()
			this.user = auth_data.record
		} catch {
			this.logout()
		}
	}
}

export const auth_client = new PocketBaseAuthClient()
export const auth = auth_client
