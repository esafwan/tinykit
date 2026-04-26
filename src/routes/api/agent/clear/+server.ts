import { json } from '@sveltejs/kit'
import type { RequestHandler } from './$types'
import { server_backend } from '$lib/backend'

// This would reset the agent conversation history
// For now, it's a placeholder - agent instance is created per-request in prompt endpoint

export const POST: RequestHandler = async ({ request }) => {
	// Require authentication
	const user = await server_backend.validate_user_token(request)
	if (!user) {
		return server_backend.unauthorized_response('Authentication required')
	}

	return json({ success: true, message: 'Conversation cleared' })
}
