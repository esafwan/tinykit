import { json } from '@sveltejs/kit'
import type { RequestHandler } from './$types'
import { server_backend } from '$lib/backend'

export const GET: RequestHandler = async ({ request }) => {
	// Require auth
	const user = await server_backend.validate_user_token(request)
	if (!user) {
		return server_backend.unauthorized_response()
	}

	const domains = await server_backend.get_available_domains()
	return json({ domains })
}
