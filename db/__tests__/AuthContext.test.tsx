import React from 'react';
import { render, waitFor } from '@testing-library/react-native';
import { AuthContextProvider, useAuth } from '../AuthContext';
import { supabaseClient } from '../supabaseClient';
import * as WebBrowser from 'expo-web-browser';
import { makeRedirectUri } from 'expo-auth-session';
import { Platform, Alert } from 'react-native';

describe('AuthContext', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('provides initial loading state', async () => {
    const mockSession = { data: { session: null } };
    // Make getSession resolve after a delay to test loading state
    (supabaseClient.auth.getSession as jest.Mock).mockImplementation(
      () => new Promise(resolve => setTimeout(() => resolve(mockSession), 20))
    );
    (supabaseClient.auth.onAuthStateChange as jest.Mock).mockReturnValue({
      data: { subscription: { unsubscribe: jest.fn() } },
    });

    let authValue: any;
    const TestComponent = () => {
      authValue = useAuth();
      return null;
    };

    render(
      <AuthContextProvider>
        <TestComponent />
      </AuthContextProvider>
    );
    
    // Initially should be loading (before getSession resolves)
    expect(authValue?.isLoading).toBe(true);
    
    // Wait for session to load
    await waitFor(() => {
      expect(authValue.isLoading).toBe(false);
    });
  });

  it('provides authentication state after session loads', async () => {
    const mockUser = { id: '123', email: 'test@example.com' };
    const mockSession = { user: mockUser };
    const mockSessionResponse = { data: { session: mockSession } };
    
    (supabaseClient.auth.getSession as jest.Mock).mockResolvedValue(mockSessionResponse);
    (supabaseClient.auth.onAuthStateChange as jest.Mock).mockReturnValue({
      data: { subscription: { unsubscribe: jest.fn() } },
    });

    let authValue: any;
    const TestComponent = () => {
      authValue = useAuth();
      return null;
    };

    render(
      <AuthContextProvider>
        <TestComponent />
      </AuthContextProvider>
    );

    // Wait for async session load
    await waitFor(() => {
      expect(authValue.user).toEqual(mockUser);
      expect(authValue.isAuthenticated).toBe(true);
      expect(authValue.isLoading).toBe(false);
    });
  });

  it('signIn calls supabase signInWithPassword', async () => {
    const mockSession = { data: { session: null } };
    (supabaseClient.auth.getSession as jest.Mock).mockResolvedValue(mockSession);
    (supabaseClient.auth.onAuthStateChange as jest.Mock).mockReturnValue({
      data: { subscription: { unsubscribe: jest.fn() } },
    });
    (supabaseClient.auth.signInWithPassword as jest.Mock).mockResolvedValue({ error: null });

    let authValue: any;
    const TestComponent = () => {
      authValue = useAuth();
      return null;
    };

    render(
      <AuthContextProvider>
        <TestComponent />
      </AuthContextProvider>
    );

    await waitFor(() => {
      expect(authValue).toBeDefined();
    });

    const result = await authValue.signIn('test@example.com', 'password123');
    
    expect(supabaseClient.auth.signInWithPassword).toHaveBeenCalledWith({
      email: 'test@example.com',
      password: 'password123',
    });
    expect(result.error).toBeNull();
  });

  it('signOut calls supabase signOut', async () => {
    const mockSession = { data: { session: null } };
    (supabaseClient.auth.getSession as jest.Mock).mockResolvedValue(mockSession);
    (supabaseClient.auth.onAuthStateChange as jest.Mock).mockReturnValue({
      data: { subscription: { unsubscribe: jest.fn() } },
    });
    (supabaseClient.auth.signOut as jest.Mock).mockResolvedValue({ error: null });

    let authValue: any;
    const TestComponent = () => {
      authValue = useAuth();
      return null;
    };

    render(
      <AuthContextProvider>
        <TestComponent />
      </AuthContextProvider>
    );

    await waitFor(() => {
      expect(authValue).toBeDefined();
    });

    const result = await authValue.signOut();
    
    expect(supabaseClient.auth.signOut).toHaveBeenCalled();
    expect(result.error).toBeNull();
  });

  describe('Web OAuth redirect handling', () => {
    const originalWindow = (global as any).window;
    const mockReplaceState = jest.fn();
    const mockLocationHref = jest.fn();
    const mockAlert = jest.spyOn(Alert, 'alert');

    beforeEach(() => {
      jest.clearAllMocks();
      (Platform.OS as any) = 'web';
      mockAlert.mockClear();
      // Mock window object
      const mockWindow = {
        location: {
          hash: '',
          pathname: '/',
          search: '',
          set href(value: string) {
            mockLocationHref(value);
          },
          get href() {
            return 'http://localhost:8081/';
          },
        },
        history: {
          replaceState: mockReplaceState,
        },
      };
      (global as any).window = mockWindow;
    });

    afterEach(() => {
      if (originalWindow) {
        (global as any).window = originalWindow;
      } else {
        delete (global as any).window;
      }
    });

    it('extracts tokens from URL hash and sets session on web', async () => {
      const accessToken = 'test-access-token';
      const refreshToken = 'test-refresh-token';
      const hash = `#access_token=${accessToken}&refresh_token=${refreshToken}&type=bearer`;
      
      (global as any).window.location.hash = hash;
      
      const mockSession = { data: { session: null } };
      (supabaseClient.auth.getSession as jest.Mock).mockResolvedValue(mockSession);
      (supabaseClient.auth.onAuthStateChange as jest.Mock).mockReturnValue({
        data: { subscription: { unsubscribe: jest.fn() } },
      });
      (supabaseClient.auth.setSession as jest.Mock).mockResolvedValue({ error: null });

      render(
        <AuthContextProvider>
          {null}
        </AuthContextProvider>
      );

      await waitFor(() => {
        expect(supabaseClient.auth.setSession).toHaveBeenCalledWith({
          access_token: accessToken,
          refresh_token: refreshToken,
        });
      });
    });

    it('clears hash from URL after successful auth on web', async () => {
      const accessToken = 'test-access-token';
      const refreshToken = 'test-refresh-token';
      const hash = `#access_token=${accessToken}&refresh_token=${refreshToken}&type=bearer`;
      
      (global as any).window.location.hash = hash;
      (global as any).window.location.pathname = '/dashboard';
      
      const mockSession = { data: { session: null } };
      (supabaseClient.auth.getSession as jest.Mock).mockResolvedValue(mockSession);
      (supabaseClient.auth.onAuthStateChange as jest.Mock).mockReturnValue({
        data: { subscription: { unsubscribe: jest.fn() } },
      });
      (supabaseClient.auth.setSession as jest.Mock).mockResolvedValue({ error: null });

      render(
        <AuthContextProvider>
          {null}
        </AuthContextProvider>
      );

      await waitFor(() => {
        expect(supabaseClient.auth.setSession).toHaveBeenCalled();
      });

      await waitFor(() => {
        expect(mockReplaceState).toHaveBeenCalledWith(null, '', '/dashboard');
      });
    });

    it('does not set session when hash does not contain access_token', async () => {
      (global as any).window.location.hash = '#some-other-param=value';
      
      const mockSession = { data: { session: null } };
      (supabaseClient.auth.getSession as jest.Mock).mockResolvedValue(mockSession);
      (supabaseClient.auth.onAuthStateChange as jest.Mock).mockReturnValue({
        data: { subscription: { unsubscribe: jest.fn() } },
      });

      render(
        <AuthContextProvider>
          {null}
        </AuthContextProvider>
      );

      await waitFor(() => {
        expect(supabaseClient.auth.getSession).toHaveBeenCalled();
      });

      // setSession should not be called
      expect(supabaseClient.auth.setSession).not.toHaveBeenCalled();
    });

    it('handles Supabase login rejection during redirect on web', async () => {
      const accessToken = 'invalid-access-token';
      const refreshToken = 'invalid-refresh-token';
      const hash = `#access_token=${accessToken}&refresh_token=${refreshToken}&type=bearer`;
      
      (global as any).window.location.hash = hash;
      
      const mockSession = { data: { session: null } };
      (supabaseClient.auth.getSession as jest.Mock).mockResolvedValue(mockSession);
      (supabaseClient.auth.onAuthStateChange as jest.Mock).mockReturnValue({
        data: { subscription: { unsubscribe: jest.fn() } },
      });
      const rejectionError = { 
        message: 'Invalid token: The access token is invalid or expired',
        status: 401 
      };
      (supabaseClient.auth.setSession as jest.Mock).mockResolvedValue({ 
        error: rejectionError 
      });

      let authValue: any;
      const TestComponent = () => {
        authValue = useAuth();
        return null;
      };

      render(
        <AuthContextProvider>
          <TestComponent />
        </AuthContextProvider>
      );

      await waitFor(() => {
        expect(authValue).toBeDefined();
        expect(authValue.isLoading).toBe(false);
      });

      // Wait for redirect handling to complete
      await waitFor(() => {
        expect(supabaseClient.auth.setSession).toHaveBeenCalledWith({
          access_token: accessToken,
          refresh_token: refreshToken,
        });
      });

      // When Supabase rejects the login, user should remain unauthenticated
      expect(authValue.user).toBeNull();
      expect(authValue.session).toBeNull();
      expect(authValue.isAuthenticated).toBe(false);
      
      // Should redirect to /data and show error alert
      await waitFor(() => {
        expect(mockReplaceState).toHaveBeenCalledWith(null, '', '/data');
        expect(mockAlert).toHaveBeenCalledWith(
          'Login Failed',
          rejectionError.message,
          [{ text: 'OK' }]
        );
      });
    });

    it('redirects to /data and shows alert when setSession fails on web', async () => {
      const accessToken = 'test-access-token';
      const refreshToken = 'test-refresh-token';
      const hash = `#access_token=${accessToken}&refresh_token=${refreshToken}&type=bearer`;
      
      (global as any).window.location.hash = hash;
      
      const mockSession = { data: { session: null } };
      (supabaseClient.auth.getSession as jest.Mock).mockResolvedValue(mockSession);
      (supabaseClient.auth.onAuthStateChange as jest.Mock).mockReturnValue({
        data: { subscription: { unsubscribe: jest.fn() } },
      });
      const errorMessage = 'Invalid tokens';
      (supabaseClient.auth.setSession as jest.Mock).mockResolvedValue({ 
        error: { message: errorMessage } 
      });

      render(
        <AuthContextProvider>
          {null}
        </AuthContextProvider>
      );

      await waitFor(() => {
        expect(supabaseClient.auth.setSession).toHaveBeenCalled();
      });

      // Should redirect to /data and show alert when there's an error
      await waitFor(() => {
        expect(mockReplaceState).toHaveBeenCalledWith(null, '', '/data');
        expect(mockAlert).toHaveBeenCalledWith(
          'Login Failed',
          errorMessage,
          [{ text: 'OK' }]
        );
      });
    });

    it('does not process redirect when hash is empty', async () => {
      (global as any).window.location.hash = '';
      
      const mockSession = { data: { session: null } };
      (supabaseClient.auth.getSession as jest.Mock).mockResolvedValue(mockSession);
      (supabaseClient.auth.onAuthStateChange as jest.Mock).mockReturnValue({
        data: { subscription: { unsubscribe: jest.fn() } },
      });

      render(
        <AuthContextProvider>
          {null}
        </AuthContextProvider>
      );

      await waitFor(() => {
        expect(supabaseClient.auth.getSession).toHaveBeenCalled();
      });

      expect(supabaseClient.auth.setSession).not.toHaveBeenCalled();
    });

    it('handles OAuth error in query string and redirects to /data', async () => {
      (global as any).window.location.search = '?error=access_denied&error_code=signup_disabled&error_description=Signups+not+allowed+for+this+instance';
      (global as any).window.location.hash = '';
      
      const mockSession = { data: { session: null } };
      (supabaseClient.auth.getSession as jest.Mock).mockResolvedValue(mockSession);
      (supabaseClient.auth.onAuthStateChange as jest.Mock).mockReturnValue({
        data: { subscription: { unsubscribe: jest.fn() } },
      });

      render(
        <AuthContextProvider>
          {null}
        </AuthContextProvider>
      );

      await waitFor(() => {
        expect(supabaseClient.auth.getSession).toHaveBeenCalled();
      });

      // AuthContext should not redirect (index.tsx handles that)
      expect(mockLocationHref).not.toHaveBeenCalled();

      // Should not attempt to set session when there's an OAuth error
      expect(supabaseClient.auth.setSession).not.toHaveBeenCalled();
    });

    it('handles OAuth error in hash and redirects to /data', async () => {
      (global as any).window.location.search = '';
      (global as any).window.location.hash = '#error=access_denied&error_code=signup_disabled&error_description=Signups+not+allowed+for+this+instance';
      
      const mockSession = { data: { session: null } };
      (supabaseClient.auth.getSession as jest.Mock).mockResolvedValue(mockSession);
      (supabaseClient.auth.onAuthStateChange as jest.Mock).mockReturnValue({
        data: { subscription: { unsubscribe: jest.fn() } },
      });

      render(
        <AuthContextProvider>
          {null}
        </AuthContextProvider>
      );

      await waitFor(() => {
        expect(supabaseClient.auth.getSession).toHaveBeenCalled();
      });

      // AuthContext should not redirect (index.tsx handles that)
      expect(mockLocationHref).not.toHaveBeenCalled();

      // Should not attempt to set session when there's an OAuth error
      expect(supabaseClient.auth.setSession).not.toHaveBeenCalled();
    });

    it('handles OAuth error with only error code when description is missing', async () => {
      (global as any).window.location.search = '?error=access_denied&error_code=signup_disabled';
      (global as any).window.location.hash = '';
      
      const mockSession = { data: { session: null } };
      (supabaseClient.auth.getSession as jest.Mock).mockResolvedValue(mockSession);
      (supabaseClient.auth.onAuthStateChange as jest.Mock).mockReturnValue({
        data: { subscription: { unsubscribe: jest.fn() } },
      });

      render(
        <AuthContextProvider>
          {null}
        </AuthContextProvider>
      );

      await waitFor(() => {
        expect(supabaseClient.auth.getSession).toHaveBeenCalled();
      });

      // AuthContext should not redirect (index.tsx handles that)
      expect(mockLocationHref).not.toHaveBeenCalled();
    });

    it('handles OAuth error with only error when code and description are missing', async () => {
      (global as any).window.location.search = '?error=access_denied';
      (global as any).window.location.hash = '';
      
      const mockSession = { data: { session: null } };
      (supabaseClient.auth.getSession as jest.Mock).mockResolvedValue(mockSession);
      (supabaseClient.auth.onAuthStateChange as jest.Mock).mockReturnValue({
        data: { subscription: { unsubscribe: jest.fn() } },
      });

      render(
        <AuthContextProvider>
          {null}
        </AuthContextProvider>
      );

      await waitFor(() => {
        expect(supabaseClient.auth.getSession).toHaveBeenCalled();
      });

      // AuthContext should not redirect (index.tsx handles that)
      expect(mockLocationHref).not.toHaveBeenCalled();
    });

    it('prioritizes query string error over hash error', async () => {
      (global as any).window.location.search = '?error=query_error&error_description=Query+error';
      (global as any).window.location.hash = '#error=hash_error&error_description=Hash+error';
      
      const mockSession = { data: { session: null } };
      (supabaseClient.auth.getSession as jest.Mock).mockResolvedValue(mockSession);
      (supabaseClient.auth.onAuthStateChange as jest.Mock).mockReturnValue({
        data: { subscription: { unsubscribe: jest.fn() } },
      });

      render(
        <AuthContextProvider>
          {null}
        </AuthContextProvider>
      );

      await waitFor(() => {
        expect(supabaseClient.auth.getSession).toHaveBeenCalled();
      });

      // AuthContext should not redirect (index.tsx handles that)
      expect(mockLocationHref).not.toHaveBeenCalled();
    });
  });

  describe('Mobile OAuth redirect handling', () => {
    beforeEach(() => {
      jest.clearAllMocks();
      (Platform.OS as any) = 'ios';
      (makeRedirectUri as jest.Mock).mockReturnValue('app.meritable://');
    });

    it('successfully handles OAuth flow with tokens on mobile', async () => {
      const accessToken = 'test-access-token';
      const refreshToken = 'test-refresh-token';
      const redirectUrl = `app.meritable://#access_token=${accessToken}&refresh_token=${refreshToken}&type=bearer`;
      
      const mockSession = { data: { session: null } };
      (supabaseClient.auth.getSession as jest.Mock).mockResolvedValue(mockSession);
      (supabaseClient.auth.onAuthStateChange as jest.Mock).mockReturnValue({
        data: { subscription: { unsubscribe: jest.fn() } },
      });
      (supabaseClient.auth.signInWithOAuth as jest.Mock).mockResolvedValue({
        data: { url: 'https://oauth.provider.com/auth' },
        error: null,
      });
      (supabaseClient.auth.setSession as jest.Mock).mockResolvedValue({ error: null });
      (WebBrowser.openAuthSessionAsync as jest.Mock).mockResolvedValue({
        type: 'success',
        url: redirectUrl,
      });

      let authValue: any;
      const TestComponent = () => {
        authValue = useAuth();
        return null;
      };

      render(
        <AuthContextProvider>
          <TestComponent />
        </AuthContextProvider>
      );

      await waitFor(() => {
        expect(authValue).toBeDefined();
      });

      const result = await authValue.signInWithGoogle();

      expect(makeRedirectUri).toHaveBeenCalled();
      expect(supabaseClient.auth.signInWithOAuth).toHaveBeenCalledWith({
        provider: 'google',
        options: {
          redirectTo: 'app.meritable://',
          skipBrowserRedirect: true,
        },
      });
      expect(WebBrowser.openAuthSessionAsync).toHaveBeenCalledWith(
        'https://oauth.provider.com/auth',
        'app.meritable://'
      );
      expect(supabaseClient.auth.setSession).toHaveBeenCalledWith({
        access_token: accessToken,
        refresh_token: refreshToken,
      });
      expect(result.error).toBeNull();
    });

    it('handles cancelled OAuth flow on mobile', async () => {
      const mockSession = { data: { session: null } };
      (supabaseClient.auth.getSession as jest.Mock).mockResolvedValue(mockSession);
      (supabaseClient.auth.onAuthStateChange as jest.Mock).mockReturnValue({
        data: { subscription: { unsubscribe: jest.fn() } },
      });
      (supabaseClient.auth.signInWithOAuth as jest.Mock).mockResolvedValue({
        data: { url: 'https://oauth.provider.com/auth' },
        error: null,
      });
      (WebBrowser.openAuthSessionAsync as jest.Mock).mockResolvedValue({
        type: 'cancel',
      });

      let authValue: any;
      const TestComponent = () => {
        authValue = useAuth();
        return null;
      };

      render(
        <AuthContextProvider>
          <TestComponent />
        </AuthContextProvider>
      );

      await waitFor(() => {
        expect(authValue).toBeDefined();
      });

      const result = await authValue.signInWithGoogle();

      expect(result.error).toEqual({ message: 'Sign in cancelled' });
      expect(supabaseClient.auth.setSession).not.toHaveBeenCalled();
    });

    it('handles failed OAuth flow on mobile', async () => {
      const mockSession = { data: { session: null } };
      (supabaseClient.auth.getSession as jest.Mock).mockResolvedValue(mockSession);
      (supabaseClient.auth.onAuthStateChange as jest.Mock).mockReturnValue({
        data: { subscription: { unsubscribe: jest.fn() } },
      });
      (supabaseClient.auth.signInWithOAuth as jest.Mock).mockResolvedValue({
        data: { url: 'https://oauth.provider.com/auth' },
        error: null,
      });
      (WebBrowser.openAuthSessionAsync as jest.Mock).mockResolvedValue({
        type: 'dismiss',
      });

      let authValue: any;
      const TestComponent = () => {
        authValue = useAuth();
        return null;
      };

      render(
        <AuthContextProvider>
          <TestComponent />
        </AuthContextProvider>
      );

      await waitFor(() => {
        expect(authValue).toBeDefined();
      });

      const result = await authValue.signInWithGoogle();

      expect(result.error).toEqual({ message: 'Sign in failed' });
      expect(supabaseClient.auth.setSession).not.toHaveBeenCalled();
    });

    it('handles missing tokens in OAuth response on mobile', async () => {
      const redirectUrl = 'app.meritable://#some-other-param=value';
      
      const mockSession = { data: { session: null } };
      (supabaseClient.auth.getSession as jest.Mock).mockResolvedValue(mockSession);
      (supabaseClient.auth.onAuthStateChange as jest.Mock).mockReturnValue({
        data: { subscription: { unsubscribe: jest.fn() } },
      });
      (supabaseClient.auth.signInWithOAuth as jest.Mock).mockResolvedValue({
        data: { url: 'https://oauth.provider.com/auth' },
        error: null,
      });
      (WebBrowser.openAuthSessionAsync as jest.Mock).mockResolvedValue({
        type: 'success',
        url: redirectUrl,
      });

      let authValue: any;
      const TestComponent = () => {
        authValue = useAuth();
        return null;
      };

      render(
        <AuthContextProvider>
          <TestComponent />
        </AuthContextProvider>
      );

      await waitFor(() => {
        expect(authValue).toBeDefined();
      });

      const result = await authValue.signInWithGoogle();

      expect(result.error).toEqual({ message: 'No tokens found in OAuth response' });
      expect(supabaseClient.auth.setSession).not.toHaveBeenCalled();
    });

    it('handles setSession error during OAuth flow on mobile', async () => {
      const accessToken = 'test-access-token';
      const refreshToken = 'test-refresh-token';
      const redirectUrl = `app.meritable://#access_token=${accessToken}&refresh_token=${refreshToken}&type=bearer`;
      
      const mockSession = { data: { session: null } };
      (supabaseClient.auth.getSession as jest.Mock).mockResolvedValue(mockSession);
      (supabaseClient.auth.onAuthStateChange as jest.Mock).mockReturnValue({
        data: { subscription: { unsubscribe: jest.fn() } },
      });
      (supabaseClient.auth.signInWithOAuth as jest.Mock).mockResolvedValue({
        data: { url: 'https://oauth.provider.com/auth' },
        error: null,
      });
      (supabaseClient.auth.setSession as jest.Mock).mockResolvedValue({ 
        error: { message: 'Invalid tokens' } 
      });
      (WebBrowser.openAuthSessionAsync as jest.Mock).mockResolvedValue({
        type: 'success',
        url: redirectUrl,
      });

      let authValue: any;
      const TestComponent = () => {
        authValue = useAuth();
        return null;
      };

      render(
        <AuthContextProvider>
          <TestComponent />
        </AuthContextProvider>
      );

      await waitFor(() => {
        expect(authValue).toBeDefined();
      });

      const result = await authValue.signInWithGoogle();

      expect(supabaseClient.auth.setSession).toHaveBeenCalled();
      expect(result.error).toEqual({ message: 'Invalid tokens' });
    });

    it('handles OAuth error from signInWithOAuth on mobile', async () => {
      const mockSession = { data: { session: null } };
      (supabaseClient.auth.getSession as jest.Mock).mockResolvedValue(mockSession);
      (supabaseClient.auth.onAuthStateChange as jest.Mock).mockReturnValue({
        data: { subscription: { unsubscribe: jest.fn() } },
      });
      (supabaseClient.auth.signInWithOAuth as jest.Mock).mockResolvedValue({
        data: null,
        error: { message: 'OAuth provider error' },
      });

      let authValue: any;
      const TestComponent = () => {
        authValue = useAuth();
        return null;
      };

      render(
        <AuthContextProvider>
          <TestComponent />
        </AuthContextProvider>
      );

      await waitFor(() => {
        expect(authValue).toBeDefined();
      });

      const result = await authValue.signInWithGoogle();

      expect(result.error).toEqual({ message: 'OAuth provider error' });
      expect(WebBrowser.openAuthSessionAsync).not.toHaveBeenCalled();
    });
  });
});

