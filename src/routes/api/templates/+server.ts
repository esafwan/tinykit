import { json } from '@sveltejs/kit'
import type { RequestHandler } from './$types'
import { server_backend } from '$lib/backend'
import { list_templates } from '$lib/templates'

// GET /api/templates - List available templates
export const GET: RequestHandler = async ({ request }) => {
	// Require authentication
	const user = await server_backend.validate_user_token(request)
	if (!user) {
		return server_backend.unauthorized_response('Authentication required')
	}

	return json(list_templates())
}
