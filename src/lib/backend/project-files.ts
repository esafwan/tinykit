import { pb } from './pocketbase'

type ProjectFileOwner = {
	id: string
	collectionId?: string
	collectionName?: string
}

export function get_project_file_url(
	project: ProjectFileOwner,
	filename: string,
	options?: { thumb?: string }
): string {
	const collection_id = project.collectionId || project.collectionName || '_tk_projects'

	return pb.files.getURL(
		{
			id: project.id,
			collectionId: collection_id,
			collectionName: project.collectionName || collection_id
		},
		filename,
		options
	)
}

export function get_published_html_url(
	project: ProjectFileOwner & { published_html?: string | null }
): string | null {
	if (!project.published_html) {
		return null
	}

	return get_project_file_url(project, project.published_html)
}

export async function fetch_published_html(
	project: ProjectFileOwner & { published_html?: string | null }
): Promise<string | null> {
	const file_url = get_published_html_url(project)
	if (!file_url) {
		return null
	}

	const response = await fetch(file_url)
	if (!response.ok) {
		return null
	}

	return response.text()
}
