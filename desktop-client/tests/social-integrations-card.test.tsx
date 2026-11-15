import { ChakraProvider, defaultSystem } from '@chakra-ui/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { useSettingsStore } from '../src/entities/settings';
import { SocialIntegrationsSettingsCard } from '../src/features/settings-management/ui/SocialIntegrationsSettingsCard';

function renderWithProviders(ui: React.ReactElement) {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
    },
  });

  return render(
    <ChakraProvider value={defaultSystem}>
      <QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>
    </ChakraProvider>,
  );
}

describe('Social Integrations & OAuth Settings Card', () => {
  beforeEach(() => {
    useSettingsStore.getState().resetSettings();
  });

  afterEach(() => {
    cleanup();
  });

  it('renders all 5 integration sections and step-by-step guides', () => {
    renderWithProviders(<SocialIntegrationsSettingsCard />);

    expect(screen.getByText(/Інтеграції, Соцмережі та Ключі API/i)).toBeDefined();
    expect(screen.getByText(/1. YouTube Shorts \(Google OAuth 2.0 PKCE\)/i)).toBeDefined();
    expect(screen.getByText(/2. Telegram Channel \(Bot API\)/i)).toBeDefined();
    expect(screen.getByText(/3. Google Gemini AI/i)).toBeDefined();
    expect(screen.getByText(/4. NASA Open Data & 3D Catalog API/i)).toBeDefined();
    expect(screen.getByText(/5. Локальна папка експорту відеороликів/i)).toBeDefined();
  });

  it('connects YouTube Shorts OAuth with Client ID validation', async () => {
    renderWithProviders(<SocialIntegrationsSettingsCard />);

    const ytInput = screen.getByPlaceholderText(/Введіть Google OAuth Client ID/i);
    const connectBtn = screen.getByRole('button', { name: /Підключити OAuth/i });

    // Click without client id shows validation warning
    fireEvent.click(connectBtn);
    expect(screen.getByText(/вкажіть Google OAuth Client ID/i)).toBeDefined();

    // Fill valid client id
    fireEvent.change(ytInput, {
      target: { value: '123456789-cosmolost.apps.googleusercontent.com' },
    });
    fireEvent.click(connectBtn);

    await waitFor(() => {
      expect(useSettingsStore.getState().settings.youtubeConnected).toBe(true);
      expect(useSettingsStore.getState().settings.youtubeClientId).toBe(
        '123456789-cosmolost.apps.googleusercontent.com',
      );
    });
  });

  it('validates and configures Telegram Bot credentials', async () => {
    renderWithProviders(<SocialIntegrationsSettingsCard />);

    const tokenInput = screen.getByPlaceholderText(/Bot Token/i);
    const chatInput = screen.getByPlaceholderText(/Username каналу/i);
    const testBtn = screen.getByRole('button', { name: /Перевірити/i });

    fireEvent.change(tokenInput, {
      target: { value: '7123456789:ABCdefGHIjklMNOpqrSTUvwxYZ' },
    });
    fireEvent.change(chatInput, { target: { value: '@cosmolost_test_channel' } });
    fireEvent.click(testBtn);

    await waitFor(() => {
      expect(useSettingsStore.getState().settings.telegramBotToken).toBe(
        '7123456789:ABCdefGHIjklMNOpqrSTUvwxYZ',
      );
      expect(useSettingsStore.getState().settings.telegramChatId).toBe('@cosmolost_test_channel');
    });
  });

  it('saves Gemini API key and NASA custom API key on batch save', async () => {
    renderWithProviders(<SocialIntegrationsSettingsCard />);

    const geminiInput = screen.getByPlaceholderText(/Введіть Gemini API Key/i);
    const nasaInput = screen.getByPlaceholderText(/NASA API Key/i);
    const saveAllBtn = screen.getByRole('button', { name: /Зберегти всі зміни/i });

    fireEvent.change(geminiInput, { target: { value: 'AIzaSyExampleTestKey123' } });
    fireEvent.change(nasaInput, { target: { value: 'CUSTOM_NASA_KEY_456' } });
    fireEvent.click(saveAllBtn);

    await waitFor(() => {
      expect(useSettingsStore.getState().settings.geminiApiKey).toBe('AIzaSyExampleTestKey123');
      expect(useSettingsStore.getState().settings.nasaApiKey).toBe('CUSTOM_NASA_KEY_456');
    });
  });

  it('applies Google OAuth authorization code and activates YouTube channel', async () => {
    renderWithProviders(<SocialIntegrationsSettingsCard />);

    const authCodeInput = screen.getByPlaceholderText(/Вставте Google Authorization Code/i);
    const confirmBtn = screen.getByRole('button', { name: /Підтвердити Код/i });

    fireEvent.change(authCodeInput, {
      target: {
        value: '4/0AUn6Hd8DBQ1SVUeGEgJBxln9lTerL-CvZPPvCPua1Kize4qYeKf2Nbq32-APJ2akkUdG2A',
      },
    });
    fireEvent.click(confirmBtn);

    await waitFor(() => {
      const state = useSettingsStore.getState().settings;
      expect(state.youtubeConnected).toBe(true);
      expect(state.youtubeAuthCode).toBe(
        '4/0AUn6Hd8DBQ1SVUeGEgJBxln9lTerL-CvZPPvCPua1Kize4qYeKf2Nbq32-APJ2akkUdG2A',
      );
    });

    expect(screen.getByText(/Google Authorization Code успішно збережено/i)).toBeDefined();
  });
});
