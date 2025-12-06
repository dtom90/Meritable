import React from 'react';
import renderer from 'react-test-renderer';
import { AuthContextProvider, useAuth } from '../AuthContext';
import { supabaseClient } from '../supabaseClient';

describe('AuthContext', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('provides initial loading state', async () => {
    const mockSession = { data: { session: null } };
    (supabaseClient.auth.getSession as jest.Mock).mockResolvedValue(mockSession);
    (supabaseClient.auth.onAuthStateChange as jest.Mock).mockReturnValue({
      data: { subscription: { unsubscribe: jest.fn() } },
    });

    let authValue: any;
    const TestComponent = () => {
      authValue = useAuth();
      return null;
    };

    const tree = renderer.create(
      <AuthContextProvider>
        <TestComponent />
      </AuthContextProvider>
    );

    // Wait a tick for component to render
    await new Promise(resolve => setTimeout(resolve, 0));
    
    // Initially loading should be true
    expect(authValue?.isLoading).toBe(true);
    
    // Wait for session to load
    await new Promise(resolve => setTimeout(resolve, 50));
    
    // Force update to get latest state
    tree.update(
      <AuthContextProvider>
        <TestComponent />
      </AuthContextProvider>
    );
    
    // After loading, should be false
    expect(authValue.isLoading).toBe(false);
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

    const tree = renderer.create(
      <AuthContextProvider>
        <TestComponent />
      </AuthContextProvider>
    );

    // Wait for async session load - need to wait for promises to resolve
    await new Promise(resolve => setTimeout(resolve, 50));
    
    // Force update to get latest state
    tree.update(
      <AuthContextProvider>
        <TestComponent />
      </AuthContextProvider>
    );

    expect(authValue.user).toEqual(mockUser);
    expect(authValue.isAuthenticated).toBe(true);
    expect(authValue.isLoading).toBe(false);
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

    renderer.create(
      <AuthContextProvider>
        <TestComponent />
      </AuthContextProvider>
    );

    await new Promise(resolve => setTimeout(resolve, 0));

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

    renderer.create(
      <AuthContextProvider>
        <TestComponent />
      </AuthContextProvider>
    );

    await new Promise(resolve => setTimeout(resolve, 0));

    const result = await authValue.signOut();
    
    expect(supabaseClient.auth.signOut).toHaveBeenCalled();
    expect(result.error).toBeNull();
  });
});

