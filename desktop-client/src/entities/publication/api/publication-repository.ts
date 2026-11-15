import type { SmmRubricType } from '@/shared/api';
import type { IPublicationRepository, PublicationProject } from '../model/types';
import { publicationApi } from './publication-api';

export class PublicationRepository implements IPublicationRepository {
  async createDraft(artifactId: string, rubricId: SmmRubricType): Promise<PublicationProject> {
    const id = `proj_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`;
    const newProject: PublicationProject = {
      id,
      artifactId,
      artifactName: artifactId.replace(/-/g, ' ').toUpperCase(),
      rubricId,
      status: 'DRAFT',
      targetDurationSec: 40,
      selectionReason: 'Річниця дослідження та драматичні обставини завершення місії',
      slides: [],
      seoCaption: {
        line1Hook: 'Таємниця космічного апарату 👇',
        line2Seo: 'Розбір телеметрії та відкриття. Дивись на 3D-мапі CosmoLost.',
        line3Tags: '#space #nasa #cosmolost #shorts',
      },
      pinComment: 'Як ви вважаєте, чи варто повернути цей апарат на Землю?',
      renderTimeoutSec: 40,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const existing = publicationApi.loadProjects();
    publicationApi.saveProjects([newProject, ...existing]);
    return newProject;
  }

  async saveProject(project: PublicationProject): Promise<void> {
    const existing = publicationApi.loadProjects();
    const index = existing.findIndex((p) => p.id === project.id);
    const updated = { ...project, updatedAt: new Date().toISOString() };

    if (index >= 0) {
      existing[index] = updated;
      publicationApi.saveProjects(existing);
    } else {
      publicationApi.saveProjects([updated, ...existing]);
    }
  }

  async listProjects(): Promise<PublicationProject[]> {
    return publicationApi.loadProjects();
  }
}

export const publicationRepository = new PublicationRepository();
