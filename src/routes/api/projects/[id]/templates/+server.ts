import { json } from '@sveltejs/kit'
import type { RequestHandler } from './$types'
import { server_backend } from '$lib/backend'
import { get_template } from '$lib/templates'

// POST /api/projects/:id/templates - Apply a template to project
export const POST: RequestHandler = async ({ params, request }) => {
	// Require authentication
	const user = await server_backend.validate_user_token(request)
	if (!user) {
		return server_backend.unauthorized_response('Authentication required')
	}

	try {
		const { templateId } = await request.json()

		if (!templateId) {
			return json({ error: 'templateId is required' }, { status: 400 })
		}

		const template = get_template(templateId)
		if (!template) {
			return json({ error: 'Template not found' }, { status: 404 })
		}

		await server_backend.update_project(params.id, {
			frontend_code: template.frontend_code,
			design: template.design || [],
			content: template.content || [],
			data: template.data || {}
		})

		return json({ success: true })
	} catch (error: any) {
		if (error.status === 404) {
			return json({ error: 'Project not found' }, { status: 404 })
		}
		console.error('Template apply error:', error)
		return json({ error: String(error) }, { status: 500 })
	}
}
