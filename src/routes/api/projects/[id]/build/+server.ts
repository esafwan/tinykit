import { json } from '@sveltejs/kit'
import type { RequestHandler } from './$types'
import { server_backend } from '$lib/backend'

// POST /api/projects/:id/build - Save build output as file attachment
export const POST: RequestHandler = async ({ params, request }) => {
	// Require authentication
	const user = await server_backend.validate_user_token(request)
	if (!user) {
		return server_backend.unauthorized_response('Authentication required')
	}

	try {
		const { html } = await request.json()

		if (!html) {
			return json({ error: 'html is required' }, { status: 400 })
		}

		await server_backend.save_published_html(params.id, html)

		return json({
			success: true,
			size: html.length
		})
	} catch (error: any) {
		if (error.status === 404) {
			return json({ error: 'Project not found' }, { status: 404 })
		}
		console.error('Build save error:', error)
		const error_message = error.response?.data || error.message || String(error)
		console.error('Build save error details:', JSON.stringify(error_message, null, 2))
		return json({ error: `${error.message || error}: ${JSON.stringify(error_message)}` }, { status: 500 })
	}
}
