import { redirect } from '@sveltejs/kit'
import type { RequestHandler } from './$types'
import { fetch_published_html, server_backend } from '$lib/backend'

/**
 * Catch-all route for SPA support
 * Serves the same published HTML for any path, allowing client-side routing
 */
export const GET: RequestHandler = async ({ locals }) => {
	// Check if setup is needed first
	const setup_complete = await server_backend.is_setup_complete()
	if (!setup_complete) {
		throw redirect(302, '/setup')
	}

	const domain = locals.domain

	// Try to find a project for this domain
	const project = await server_backend.get_project_by_domain(domain)

	if (project) {
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

		// If no compiled HTML yet, redirect to builder
		throw redirect(302, '/tinykit/studio')
	}

	// No project for this domain - redirect to new project page
	throw redirect(302, `/tinykit/new?domain=${encodeURIComponent(domain)}`)
}
