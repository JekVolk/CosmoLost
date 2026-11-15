import { ChakraProvider, defaultSystem } from '@chakra-ui/react';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import type React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { contentTemplateRepository } from '../src/entities/content-template';
import {
  CharacterPresetSelector,
  CreateCustomAvatarModal,
  usePngTuberEditorStore,
} from '../src/features/pngtuber-editor';

function renderWithChakra(ui: React.ReactElement) {
  return render(<ChakraProvider value={defaultSystem}>{ui}</ChakraProvider>);
}

describe('Custom Avatar Upload & SMM Rubrics Catalog Test Suite', () => {
  beforeEach(() => {
    localStorage.clear();
    usePngTuberEditorStore.getState().resetToDefaults();
    usePngTuberEditorStore.setState({ customCharacters: [], selectedCharacterId: 'cosmo-spark' });
  });

  afterEach(() => {
    cleanup();
    localStorage.clear();
  });

  describe('1. SMM Rubrics & Thematic Templates Completeness', () => {
    it('provides all 6 canonical SMM rubrics in ContentTemplateRepository', async () => {
      const templates = await contentTemplateRepository.listTemplates();
      expect(templates.length).toBeGreaterThanOrEqual(6);

      const rubricIds = templates.map((t) => t.id);
      expect(rubricIds).toContain('last-sol-drama');
      expect(rubricIds).toContain('tech-explain');
      expect(rubricIds).toContain('dictionary-30s');
      expect(rubricIds).toContain('crash-test');
      expect(rubricIds).toContain('build-in-public');
      expect(rubricIds).toContain('chronicles');
    });

    it('ensures each rubric has valid slide structure and ~40s target duration', async () => {
      const templates = await contentTemplateRepository.listTemplates();
      for (const t of templates) {
        expect(t.target_duration_sec).toBeGreaterThanOrEqual(30);
        expect(t.target_duration_sec).toBeLessThanOrEqual(60);
        expect(t.slide_structure.length).toBeGreaterThanOrEqual(4);
        expect(t.slide_structure[0]?.type).toBe('HOOK');
        expect(t.slide_structure[t.slide_structure.length - 1]?.type).toBe('SEAMLESS_LOOP_CTA');
      }
    });
  });

  describe('2. Custom Avatar Creation, Upload & Persistence', () => {
    it('creates a custom avatar and makes it active', () => {
      const customPayload = {
        name: 'Астро-Лис',
        role: 'LEAD SCIENTIST',
        tag: 'ORIGINAL VTUBER',
        archetype: 'Хитрий та допитливий дослідник глибокого космосу.',
        palette: ['#F97316', '#431407', '#FED7AA'],
        avatarImageUrl:
          'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
      };

      const created = usePngTuberEditorStore.getState().addCustomCharacter(customPayload);
      expect(created.id).toContain('custom-avatar-');
      expect(created.isCustom).toBe(true);
      expect(created.name).toBe('Астро-Лис');

      // State check
      const state = usePngTuberEditorStore.getState();
      expect(state.selectedCharacterId).toBe(created.id);
      expect(state.customCharacters).toHaveLength(1);

      // Sprites auto-propagation
      const idleSprite = state.sprites.find((s) => s.emotion === 'IDLE' && s.phase === 'CLOSED');
      expect(idleSprite?.customDataUrl).toBe(customPayload.avatarImageUrl);
    });

    it('deletes a custom avatar and safely falls back to default character', () => {
      const created = usePngTuberEditorStore.getState().addCustomCharacter({
        name: 'Тимчасовий Бот',
        role: 'TEMP',
        tag: 'TEST',
        archetype: 'Тестовий бот',
        palette: ['#000000', '#ffffff'],
      });

      expect(usePngTuberEditorStore.getState().selectedCharacterId).toBe(created.id);

      // Delete
      usePngTuberEditorStore.getState().deleteCustomCharacter(created.id);
      expect(usePngTuberEditorStore.getState().customCharacters).toHaveLength(0);
      expect(usePngTuberEditorStore.getState().selectedCharacterId).toBe('cosmo-spark');
    });
  });

  describe('3. CharacterPresetSelector & CreateCustomAvatarModal UI Flow', () => {
    it('renders CharacterPresetSelector with "+ Створити свій аватар" card', () => {
      const onSelectMock = vi.fn();
      renderWithChakra(
        <CharacterPresetSelector selectedId="cosmo-spark" onSelect={onSelectMock} />,
      );

      // Default presets
      expect(screen.getByText('Cosmo Spark (Mascot)')).toBeDefined();
      expect(screen.getByText('Commander Orion (Explorer)')).toBeDefined();
      expect(screen.getByText('Nova Vance (Pilot)')).toBeDefined();

      // Custom avatar creation button
      expect(screen.getByText('+ Створити свій аватар')).toBeDefined();
    });

    it('opens and submits CreateCustomAvatarModal form', () => {
      // Open modal
      usePngTuberEditorStore.getState().openCreateAvatarModal();

      renderWithChakra(<CreateCustomAvatarModal />);

      expect(screen.getByText('Створити власний PNGTuber-аватар')).toBeDefined();
      expect(screen.getByPlaceholderText('напр. Астро-Лис, Cyber-V')).toBeDefined();

      // Fill in name
      const nameInput = screen.getByPlaceholderText('напр. Астро-Лис, Cyber-V');
      fireEvent.change(nameInput, { target: { value: 'Кадет Оріон' } });

      // Click submit button
      const submitBtn = screen.getByRole('button', { name: /Зберегти та активувати аватар/i });
      fireEvent.click(submitBtn);

      // Character was created in store
      const customChars = usePngTuberEditorStore.getState().customCharacters;
      expect(customChars.some((c) => c.name === 'Кадет Оріон')).toBe(true);
      expect(usePngTuberEditorStore.getState().isCreateAvatarModalOpen).toBe(false);
    });
  });
});
