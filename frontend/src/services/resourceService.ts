import { departmentResources as localDepartmentResources } from '../data/departments'
import type { DepartmentResource } from '../models/event'
import { apiGet } from './apiClient'

interface BackendResource {
  slug: string
  label: string
  category: string
  url: string
  description?: string | null
}

export interface DepartmentResourceResult {
  items: DepartmentResource[]
  source: 'backend' | 'local'
}

function toDepartmentResource(resource: BackendResource): DepartmentResource {
  return {
    resourceId: resource.slug,
    title: resource.label,
    category: resource.category || 'Campus resource',
    description: resource.description?.trim() || 'Official campus resource link.',
    url: resource.url,
    cta: 'Open resource',
  }
}

export async function getDepartmentResources(): Promise<DepartmentResourceResult> {
  try {
    const response = await apiGet<{ data: BackendResource[] }>('/resources')
    const items = response.data
      .map(toDepartmentResource)
      .filter((resource) => resource.title && resource.url)

    if (!items.length) {
      return { items: localDepartmentResources, source: 'local' }
    }

    return { items, source: 'backend' }
  } catch {
    return { items: localDepartmentResources, source: 'local' }
  }
}
