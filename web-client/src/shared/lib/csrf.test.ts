import { afterEach, describe, expect, it } from 'vitest';
import { getCsrfToken } from './csrf';

describe('getCsrfToken', () => {
  afterEach(() => {
    document.cookie = 'csrftoken=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/';
  });

  it('returns null when document.cookie does not contain csrftoken', () => {
    document.cookie = 'sessionid=12345; other=value';
    expect(getCsrfToken()).toBeNull();
  });

  it('returns token when csrftoken cookie is present', () => {
    document.cookie = 'csrftoken=test-token-123; path=/';
    expect(getCsrfToken()).toBe('test-token-123');
  });

  it('handles multiple cookies correctly', () => {
    document.cookie = 'foo=bar; path=/';
    document.cookie = 'csrftoken=xyz789; path=/';
    document.cookie = 'baz=qux; path=/';
    expect(getCsrfToken()).toBe('xyz789');
  });

  it('decodes URI components if encoded', () => {
    document.cookie = 'csrftoken=token%20with%20spaces; path=/';
    expect(getCsrfToken()).toBe('token with spaces');
  });
});
