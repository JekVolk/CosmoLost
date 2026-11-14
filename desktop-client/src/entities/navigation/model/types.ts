export type TabId = 'overview' | 'fsd' | 'ipc' | 'settings';

export interface NavItem {
  id: TabId;
  label: string;
  iconName: 'home' | 'layers' | 'terminal' | 'settings';
  shortcutHint?: string;
}
