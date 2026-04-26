import { error, redirect } from '@sveltejs/kit'
import type { RequestHandler } from './$types'
import { fetch_published_html, server_backend } from '$lib/backend'

/**
 * Catch-all route for preview - serves the same HTML for any sub-path
 * This allows client-side routing to work within previewed apps
 * URL: /tinykit/preview/[id]/*
 */
export const GET: RequestHandler = async ({ params }) => {
	const { id } = params

	const project = await server_backend.get_project(id)

	if (!project) {
		throw error(404, 'Project not found')
	}

	// Serve the production app (compiled HTML from file attachment)
	if (project.published_html) {
		const html = await fetch_published_html(project)
		if (html) {
			return new Response(html, {
				headers: {
					'Content-Type': 'text/html; charset=utf-8'
				}
			})
		}
	}

	// If no compiled HTML yet, redirect to builder with a hint
	throw redirect(302, `/tinykit/studio?id=${id}&needs_build=true`)
}
