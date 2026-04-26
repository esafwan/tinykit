// Storage helpers for tinykit admin interface
import type { AgentMessage } from "../types"
import { auth_client } from "$lib/backend"

const MESSAGES_KEY = "agent-messages"

// Messages storage
export function load_messages(): AgentMessage[] {
	if (typeof window === "undefined") return []

	try {
		const saved = localStorage.getItem(MESSAGES_KEY)
		if (saved) {
			return JSON.parse(saved)
		}
	} catch (e) {
		console.error("Failed to load messages from localStorage:", e)
	}
	return []
}

export function save_messages(messages: AgentMessage[]): void {
	if (typeof window === "undefined") return
	localStorage.setItem(MESSAGES_KEY, JSON.stringify(messages))
}

export function clear_messages(): void {
	if (typeof window === "undefined") return
	localStorage.removeItem(MESSAGES_KEY)
}

// Vibe zone preference (stored in _tk_settings collection)
const VIBE_ZONE_SETTING_KEY = "vibe_zone"

function get_auth_headers(): Record<string, string> {
	const headers: Record<string, string> = {
		'Content-Type': 'application/json'
	}
	if (auth_client.token) {
		headers['Authorization'] = `Bearer ${auth_client.token}`
	}
	return headers
}

export async function load_vibe_zone_enabled(): Promise<boolean> {
	if (typeof window === "undefined") return true

	try {
		const res = await fetch(`/api/settings?key=${VIBE_ZONE_SETTING_KEY}`, {
			headers: get_auth_headers()
		})
		if (res.ok) {
			const data = await res.json()
			if (data.value !== null && typeof data.value.enabled === 'boolean') {
				return data.value.enabled
			}
		}
	} catch (e) {
		console.error("Failed to load vibe_zone_enabled:", e)
	}
	return true // Default ON for new users
}

export async function save_vibe_zone_enabled(enabled: boolean): Promise<void> {
	if (typeof window === "undefined") return

	try {
		await fetch('/api/settings', {
			method: 'POST',
			headers: get_auth_headers(),
			body: JSON.stringify({
				key: VIBE_ZONE_SETTING_KEY,
				value: { enabled }
			})
		})
	} catch (e) {
		console.error("Failed to save vibe_zone_enabled:", e)
	}
}

// Note: Project title is now managed via the SDK directly through project_service
// See src/lib/services/project.svelte.ts for project CRUD operations
