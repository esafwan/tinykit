import { json } from '@sveltejs/kit'
import type { RequestHandler } from './$types'
import { env } from '$env/dynamic/private'
import { server_backend } from '$lib/backend'

export const GET: RequestHandler = async ({ request }) => {
	// Require authentication
	const user = await server_backend.validate_user_token(request)
	if (!user) {
		return server_backend.unauthorized_response('Authentication required')
	}

	return json({
		provider: env.LLM_PROVIDER,
		model: env.LLM_MODEL,
		baseUrl: env.LLM_BASE_URL,
		hasApiKey: !!env.LLM_API_KEY,
		apiKeyLength: env.LLM_API_KEY?.length,
		apiKeyPreview: env.LLM_API_KEY?.substring(0, 20) + '...'
	})
}
