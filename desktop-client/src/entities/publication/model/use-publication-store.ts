import { create } from 'zustand';
import type {
  ContentLanguage,
  PublicationProject,
  SeriesInfo,
  SubtitleStyleConfig,
  TagGroup,
  VideoScriptSlide,
} from './types';

export const DEFAULT_SUBTITLE_STYLE: SubtitleStyleConfig = {
  preset: 'HORMOZI_YELLOW',
  textColor: '#ffffff',
  highlightColor: '#facc15',
  strokeColor: '#000000',
  strokeWidth: 4,
  isUppercase: true,
  highlightKeywords: true,
  wordsPerChunk: 3,
  fontSizePx: 26,
};

export const PREDEFINED_TAG_GROUPS: TagGroup[] = [
  {
    id: 'viral',
    name: 'Віральні тренди',
    icon: '🔥',
    tags: ['#shorts', '#viral', '#reels', '#tiktok', '#рекомендації', '#fyp'],
  },
  {
    id: 'space',
    name: 'Космос та Астрономія',
    icon: '🌌',
    tags: ['#космос', '#астрономія', '#space', '#всесвіт', '#астрофізика'],
  },
  {
    id: 'nasa',
    name: 'NASA та Марс',
    icon: '🔴',
    tags: ['#nasa', '#марс', '#марсохід', '#opportunity', '#perseverance'],
  },
  {
    id: 'science',
    name: 'Наука & Факти',
    icon: '⚡',
    tags: ['#наука', '#science', '#цікавіфакти', '#дослідження', '#відкриття'],
  },
  {
    id: 'cosmolost',
    name: 'CosmoLost 3D',
    icon: '🌐',
    tags: ['#cosmolost', '#3dмапа', '#інтерактивнамапа', '#solar3d'],
  },
];

export const POPULAR_MAGNET_WORDS: string[] = [
  '⚡ ШОК',
  '🔒 ЗАБОРОНЕНО NASA',
  '💔 ОСТАННІ СЛОВА',
  '🌌 ТАЄМНИЦЯ',
  '⚠️ КАТАСТРОФА',
  '🛸 НЕВІДОМИЙ СИГНАЛ',
  '🔍 ЗНИКЛИЙ ЗОНД',
  '🚨 ФАТАЛЬНА ПОМИЛКА',
];

export const INITIAL_DEMO_PROJECTS: PublicationProject[] = [
  {
    id: 'proj-opportunity-sol5111',
    artifactId: 'opportunity-rover',
    artifactName: 'Opportunity Rover (MER-B)',
    rubricId: 'last-sol-drama',
    status: 'READY',
    targetDurationSec: 40,
    selectionReason:
      'Трагічна загибель від пилової бурі після 15 років подорожі та знамените останнє фото сонця.',
    magnetWord: '💔 ОСТАННІ СЛОВА',
    seriesInfo: {
      seriesName: 'Хроніки Марса',
      partNumber: 1,
      totalParts: 3,
      cliffhanger: 'У наступній частині: чому вчені не змогли пробудити ровер у 2019 році...',
    },
    tagGroups: ['viral', 'space', 'nasa'],
    slides: [
      {
        id: 's1',
        slideIndex: 1,
        type: 'HOOK',
        durationSec: 3,
        narratorText:
          'Цей марсохід розраховували на 90 днів, але він прожив 15 років і надіслав це перед загибеллю...',
        visualPrompt: 'Dramatic dust storm over Perseverance Valley Mars',
        pngtuberState: 'SHOCK',
      },
      {
        id: 's2',
        slideIndex: 2,
        type: 'B_ROLL_FACTS',
        durationSec: 12,
        narratorText:
          'Opportunity пройшов 45 кілометрів по Марсу, знайшовши перші докази давніх озер та мінералів гематиту.',
        visualPrompt: 'Rover tracks across red Martian sand dunes',
        pngtuberState: 'EXPERT',
      },
      {
        id: 's3',
        slideIndex: 3,
        type: 'DRAMA_PEAK',
        durationSec: 18,
        narratorText:
          'У червні 2018 пилова буря накрила долину. Останні слова телеметрії: Батарея розряджена, і стає темно.',
        visualPrompt: 'Sun fading into darkness behind dust haze',
        pngtuberState: 'SHOCK',
      },
      {
        id: 's4',
        slideIndex: 4,
        type: 'SEAMLESS_LOOP_CTA',
        durationSec: 7,
        narratorText: 'Точне місце спочинку Opportunity та 3D-мапа вже на CosmoLost. Досліди сам!',
        visualPrompt: '3D interactive globe with Opportunity marker',
        pngtuberState: 'HYPE',
      },
    ],
    seoCaption: {
      line1Hook: 'Останні слова марсохода Opportunity, які змусили плакати вчених NASA 💔',
      line2Seo:
        'Історія легендарного марсохода Opportunity та його останнього сигналу на Солі 5111. Досліджуйте реальні координати на мапі CosmoLost.',
      line3Tags: '#Shorts #NASA #Mars #Opportunity #SpaceMystery #CosmoLost',
    },
    pinComment:
      'Як думаєте, чи зможе майбутня експедиція на Марс знайти та відновити Opportunity? Пишіть у коментарях 👇',
    subtitleStyle: DEFAULT_SUBTITLE_STYLE,
    contentLanguage: 'uk',
    renderTimeoutSec: 40,
    createdAt: '2026-11-14T10:00:00.000Z',
    updatedAt: '2026-11-14T18:30:00.000Z',
  },
  {
    id: 'proj-apollo11-lrrr',
    artifactId: 'apollo-11-lm-eagle',
    artifactName: 'Apollo 11 Lunar Module (Eagle)',
    rubricId: 'tech-explain',
    status: 'PUBLISHED',
    targetDurationSec: 38,
    selectionReason:
      'Єдиний прилад місії Аполлон-11, який досі активний без жодної батареї завдяки 100 кварцовим кутовим призмам.',
    slides: [
      {
        id: 's1',
        slideIndex: 1,
        type: 'HOOK',
        durationSec: 3,
        narratorText:
          'На Місяці є прилад Аполлона 11, який працює вже 55 років без жодної батареї!',
        visualPrompt: 'Apollo 11 laser reflector on lunar regolith',
        pngtuberState: 'SHOCK',
      },
      {
        id: 's2',
        slideIndex: 2,
        type: 'B_ROLL_FACTS',
        durationSec: 15,
        narratorText:
          'Це кутовий рефлектор LRRR зі 100 кварцовими призмами. Вчені стріляють лазером з Землі та вимірюють точну відстань до Міліметра.',
        visualPrompt: 'Green laser pulse bouncing from Earth to Moon',
        pngtuberState: 'EXPERT',
      },
      {
        id: 's3',
        slideIndex: 3,
        type: 'DRAMA_PEAK',
        durationSec: 13,
        narratorText:
          'Завдяки цьому ми знаємо: Місяць віддаляється від Землі на 3.8 сантиметра щороку.',
        visualPrompt: 'Orbital recession animation of Moon',
        pngtuberState: 'EXPERT',
      },
      {
        id: 's4',
        slideIndex: 4,
        type: 'SEAMLESS_LOOP_CTA',
        durationSec: 7,
        narratorText: 'Точні координати бази Спокою та 3D-модель приладу вже на порталі CosmoLost.',
        visualPrompt: 'CosmoLost 3D Moon interactive map',
        pngtuberState: 'HYPE',
      },
    ],
    seoCaption: {
      line1Hook: 'Прилад Аполлона 11, який працює 55 років без батарей 😱',
      line2Seo:
        'Як лазерний кутовий відбивач LRRR допомагає вимірювати рух Місяця з Землі. Дивіться 3D модель на CosmoLost.',
      line3Tags: '#Shorts #Apollo11 #NASA #Moon #ScienceFacts #Space',
    },
    pinComment:
      'А ви знали, що ми щороку втрачаємо Місяць на 3.8 см? Що буде, коли він віддалиться занадто далеко?',
    subtitleStyle: DEFAULT_SUBTITLE_STYLE,
    contentLanguage: 'en',
    renderTimeoutSec: 40,
    createdAt: '2026-11-13T14:00:00.000Z',
    updatedAt: '2026-11-14T12:00:00.000Z',
  },
  {
    id: 'proj-insight-seismometer',
    artifactId: 'insight-mars-lander',
    artifactName: 'InSight Mars Lander',
    rubricId: 'last-sol-drama',
    status: 'DRAFT',
    targetDurationSec: 40,
    selectionReason: 'Зонд, який вперше заглянув у надра Марса і записав понад 1300 марсотрусів.',
    slides: [
      {
        id: 's1',
        slideIndex: 1,
        type: 'HOOK',
        durationSec: 3,
        narratorText:
          'Цей зонд записав 1300 марсотрусів і назавжди замовк під товстим шаром пилу...',
        visualPrompt: 'InSight lander covered in reddish Mars dust',
        pngtuberState: 'SHOCK',
      },
      {
        id: 's2',
        slideIndex: 2,
        type: 'B_ROLL_FACTS',
        durationSec: 14,
        narratorText:
          'Сейсмометр SEIS почув, як метеорити падають на Марс, і відкрив рідке металеве ядро планети.',
        visualPrompt: 'Cutaway of Mars showing core and seismic waves',
        pngtuberState: 'EXPERT',
      },
      {
        id: 's3',
        slideIndex: 3,
        type: 'DRAMA_PEAK',
        durationSec: 16,
        narratorText:
          'Наприкінці 2022 сонячні панелі виробили менше 10% енергії. Його останнє фото було зроблено з розрядом у 3 вольти.',
        visualPrompt: 'Solar panels opaque with dust storm residue',
        pngtuberState: 'SHOCK',
      },
      {
        id: 's4',
        slideIndex: 4,
        type: 'SEAMLESS_LOOP_CTA',
        durationSec: 7,
        narratorText: 'Слухайте реальні записи марсотрусів InSight на порталі CosmoLost.',
        visualPrompt: 'CosmoLost portal with seismic audio player',
        pngtuberState: 'HYPE',
      },
    ],
    seoCaption: {
      line1Hook: 'Зонд InSight записав 1300 марсотрусів перед тим, як згаснути назавжди 💔',
      line2Seo:
        'Історія місії NASA InSight на Марсі: сейсмометрія, метеорити та останній день на звʼязку.',
      line3Tags: '#Shorts #NASA #Mars #InSight #SpaceDocumentary',
    },
    pinComment:
      'Чи хотіли б ви почути реальний аудіозапис марсотрусу? Заходьте на 3D-мапу CosmoLost!',
    subtitleStyle: DEFAULT_SUBTITLE_STYLE,
    contentLanguage: 'uk',
    renderTimeoutSec: 40,
    createdAt: '2026-11-14T20:00:00.000Z',
    updatedAt: '2026-11-14T21:00:00.000Z',
  },
];

interface CreateProjectParams {
  title?: string;
  artifactId: string;
  artifactName: string;
  rubricId: PublicationProject['rubricId'];
  selectionReason: string;
  targetDurationSec?: number;
  contentLanguage?: ContentLanguage;
  seriesInfo?: SeriesInfo;
  magnetWord?: string;
  tagGroups?: string[];
}

interface PublicationState {
  currentProject: PublicationProject | null;
  projects: PublicationProject[];
  setCurrentProject: (project: PublicationProject | null) => void;
  createProject: (params: CreateProjectParams) => PublicationProject;
  openProject: (id: string) => void;
  deleteProject: (id: string) => void;
  duplicateProject: (id: string) => PublicationProject;
  saveCurrentProject: () => void;
  updateSlides: (slides: VideoScriptSlide[]) => void;
  updateStatus: (status: PublicationProject['status']) => void;
  updateSeo: (seoCaption: PublicationProject['seoCaption'], pinComment: string) => void;
  setRenderTimeout: (sec: number) => void;
  attachBrollVideo: (url: string, preset: string, durationSec?: number) => void;
  updateSubtitleStyle: (style: Partial<SubtitleStyleConfig>) => void;
  setContentLanguage: (lang: ContentLanguage) => void;
  setSeriesInfo: (seriesInfo: SeriesInfo | undefined) => void;
  setMagnetWord: (word: string | undefined) => void;
  setTagGroups: (groups: string[]) => void;
  toggleTagGroup: (groupId: string) => void;
}

export const usePublicationStore = create<PublicationState>((set, get) => ({
  currentProject: null,
  projects: INITIAL_DEMO_PROJECTS,
  setCurrentProject: (project) => set({ currentProject: project }),

  createProject: (params) => {
    const defaultTagGroups = params.tagGroups || ['viral', 'space', 'nasa'];
    const initialTags = Array.from(
      new Set(
        defaultTagGroups.flatMap(
          (gid) => PREDEFINED_TAG_GROUPS.find((g) => g.id === gid)?.tags || [],
        ),
      ),
    ).join(' ');

    const newProject: PublicationProject = {
      id: `proj-${Date.now().toString(36)}`,
      artifactId: params.artifactId,
      artifactName: params.artifactName,
      rubricId: params.rubricId,
      status: 'DRAFT',
      targetDurationSec: params.targetDurationSec || 40,
      selectionReason: params.selectionReason,
      contentLanguage: params.contentLanguage || 'uk',
      seriesInfo: params.seriesInfo,
      magnetWord: params.magnetWord || '⚡ ШОК',
      tagGroups: defaultTagGroups,
      renderTimeoutSec: 40,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      subtitleStyle: DEFAULT_SUBTITLE_STYLE,
      slides: [
        {
          id: `s1-${Date.now()}`,
          slideIndex: 1,
          type: 'HOOK',
          durationSec: 3,
          narratorText: `${params.magnetWord ? `${params.magnetWord}: ` : ''}Чому ${params.artifactName} став однією з найбільших таємниць NASA?`,
          visualPrompt: `Dramatic close-up of ${params.artifactName}`,
          pngtuberState: 'SHOCK',
        },
        {
          id: `s2-${Date.now()}`,
          slideIndex: 2,
          type: 'B_ROLL_FACTS',
          durationSec: 15,
          narratorText: `${params.selectionReason || 'Наукове відкриття та спадщина місії.'}`,
          visualPrompt: 'Scientific telemetry and 3D schematics',
          pngtuberState: 'EXPERT',
        },
        {
          id: `s3-${Date.now()}`,
          slideIndex: 3,
          type: 'DRAMA_PEAK',
          durationSec: 15,
          narratorText: 'Кульмінаційний момент місії, який змінив уявлення про планету.',
          visualPrompt: 'Planetary surface landscape with high contrast',
          pngtuberState: 'EXPERT',
        },
        {
          id: `s4-${Date.now()}`,
          slideIndex: 4,
          type: 'SEAMLESS_LOOP_CTA',
          durationSec: 7,
          narratorText: params.seriesInfo?.cliffhanger
            ? `${params.seriesInfo.cliffhanger} Досліджуйте 3D-мапу на CosmoLost!`
            : 'Досліджуйте реальні 3D координати артефакту на порталі CosmoLost!',
          visualPrompt: 'CosmoLost 3D planetary map deep link',
          pngtuberState: 'HYPE',
        },
      ],
      seoCaption: {
        line1Hook: `${params.magnetWord ? `${params.magnetWord}: ` : ''}Таємниця ${params.artifactName}, про яку мовчать вчені NASA 😱`,
        line2Seo: `Дослідження місії та артефакту ${params.artifactName}. Координати та 3D-моделі на CosmoLost.`,
        line3Tags:
          initialTags || `#Shorts #NASA #Space #${params.artifactName.replace(/\s+/g, '')}`,
      },
      pinComment: `А що вас найбільше вражає в місії ${params.artifactName}? Залишайте думки в коментарях 👇`,
    };

    set((state) => ({
      projects: [newProject, ...state.projects],
      currentProject: newProject,
    }));

    return newProject;
  },

  openProject: (id) => {
    const found = get().projects.find((p) => p.id === id);
    if (found) {
      set({ currentProject: found });
    }
  },

  deleteProject: (id) => {
    set((state) => {
      const remaining = state.projects.filter((p) => p.id !== id);
      const isDeletingCurrent = state.currentProject?.id === id;
      return {
        projects: remaining,
        currentProject: isDeletingCurrent ? (remaining[0] ?? null) : state.currentProject,
      };
    });
  },

  duplicateProject: (id) => {
    const target =
      get().projects.find((p) => p.id === id) || get().currentProject || INITIAL_DEMO_PROJECTS[0];
    if (!target) {
      throw new Error('No project found to duplicate');
    }

    const clone: PublicationProject = {
      ...target,
      id: `proj-${Date.now().toString(36)}`,
      artifactName: `${target.artifactName} (Копія)`,
      status: 'DRAFT',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    set((state) => ({
      projects: [clone, ...state.projects],
      currentProject: clone,
    }));

    return clone;
  },

  saveCurrentProject: () => {
    const current = get().currentProject;
    if (!current) return;
    set((state) => ({
      projects: state.projects.map((p) => (p.id === current.id ? current : p)),
    }));
  },

  updateSlides: (slides) =>
    set((state) => {
      if (!state.currentProject) return { currentProject: null };
      const updated = { ...state.currentProject, slides, updatedAt: new Date().toISOString() };
      return {
        currentProject: updated,
        projects: state.projects.map((p) => (p.id === updated.id ? updated : p)),
      };
    }),

  updateStatus: (status) =>
    set((state) => {
      if (!state.currentProject) return { currentProject: null };
      const updated = { ...state.currentProject, status, updatedAt: new Date().toISOString() };
      return {
        currentProject: updated,
        projects: state.projects.map((p) => (p.id === updated.id ? updated : p)),
      };
    }),

  updateSeo: (seoCaption, pinComment) =>
    set((state) => {
      if (!state.currentProject) return { currentProject: null };
      const updated = {
        ...state.currentProject,
        seoCaption,
        pinComment,
        updatedAt: new Date().toISOString(),
      };
      return {
        currentProject: updated,
        projects: state.projects.map((p) => (p.id === updated.id ? updated : p)),
      };
    }),

  setRenderTimeout: (sec) =>
    set((state) => {
      if (!state.currentProject) return { currentProject: null };
      const updated = {
        ...state.currentProject,
        renderTimeoutSec: sec,
        updatedAt: new Date().toISOString(),
      };
      return {
        currentProject: updated,
        projects: state.projects.map((p) => (p.id === updated.id ? updated : p)),
      };
    }),

  attachBrollVideo: (url, preset, durationSec) =>
    set((state) => {
      if (!state.currentProject) return { currentProject: null };
      const updated = {
        ...state.currentProject,
        brollVideoUrl: url,
        brollPreset: preset,
        brollDurationSec: durationSec,
        localVideoPath: url,
        updatedAt: new Date().toISOString(),
      };
      return {
        currentProject: updated,
        projects: state.projects.map((p) => (p.id === updated.id ? updated : p)),
      };
    }),

  updateSubtitleStyle: (style) =>
    set((state) => {
      if (!state.currentProject) return { currentProject: null };
      const updated = {
        ...state.currentProject,
        subtitleStyle: {
          ...(state.currentProject.subtitleStyle || DEFAULT_SUBTITLE_STYLE),
          ...style,
        },
        updatedAt: new Date().toISOString(),
      };
      return {
        currentProject: updated,
        projects: state.projects.map((p) => (p.id === updated.id ? updated : p)),
      };
    }),

  setContentLanguage: (lang) =>
    set((state) => {
      if (!state.currentProject) return { currentProject: null };
      const updated = {
        ...state.currentProject,
        contentLanguage: lang,
        updatedAt: new Date().toISOString(),
      };
      return {
        currentProject: updated,
        projects: state.projects.map((p) => (p.id === updated.id ? updated : p)),
      };
    }),

  setSeriesInfo: (seriesInfo) =>
    set((state) => {
      if (!state.currentProject) return { currentProject: null };
      const updated = {
        ...state.currentProject,
        seriesInfo,
        updatedAt: new Date().toISOString(),
      };
      return {
        currentProject: updated,
        projects: state.projects.map((p) => (p.id === updated.id ? updated : p)),
      };
    }),

  setMagnetWord: (magnetWord) =>
    set((state) => {
      if (!state.currentProject) return { currentProject: null };
      const updated = {
        ...state.currentProject,
        magnetWord,
        updatedAt: new Date().toISOString(),
      };
      return {
        currentProject: updated,
        projects: state.projects.map((p) => (p.id === updated.id ? updated : p)),
      };
    }),

  setTagGroups: (tagGroups) =>
    set((state) => {
      if (!state.currentProject) return { currentProject: null };
      const allTags = Array.from(
        new Set(
          tagGroups.flatMap((gid) => PREDEFINED_TAG_GROUPS.find((g) => g.id === gid)?.tags || []),
        ),
      ).join(' ');
      const updated = {
        ...state.currentProject,
        tagGroups,
        seoCaption: {
          ...state.currentProject.seoCaption,
          line3Tags: allTags || state.currentProject.seoCaption.line3Tags,
        },
        updatedAt: new Date().toISOString(),
      };
      return {
        currentProject: updated,
        projects: state.projects.map((p) => (p.id === updated.id ? updated : p)),
      };
    }),

  toggleTagGroup: (groupId) =>
    set((state) => {
      if (!state.currentProject) return { currentProject: null };
      const currentGroups = state.currentProject.tagGroups || ['viral', 'space', 'nasa'];
      const nextGroups = currentGroups.includes(groupId)
        ? currentGroups.filter((g) => g !== groupId)
        : [...currentGroups, groupId];

      const allTags = Array.from(
        new Set(
          nextGroups.flatMap((gid) => PREDEFINED_TAG_GROUPS.find((g) => g.id === gid)?.tags || []),
        ),
      ).join(' ');

      const updated = {
        ...state.currentProject,
        tagGroups: nextGroups,
        seoCaption: {
          ...state.currentProject.seoCaption,
          line3Tags: allTags || state.currentProject.seoCaption.line3Tags,
        },
        updatedAt: new Date().toISOString(),
      };
      return {
        currentProject: updated,
        projects: state.projects.map((p) => (p.id === updated.id ? updated : p)),
      };
    }),
}));
