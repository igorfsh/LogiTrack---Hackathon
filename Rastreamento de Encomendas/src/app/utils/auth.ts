export interface User {
  id: string;
  name: string;
  email: string;
}

// Mock auth helpers (será substituído por Supabase)
export function getCurrentUser(): User | null {
  const user = localStorage.getItem('logitrack_user');
  return user ? JSON.parse(user) : null;
}

export function login(email: string, password: string): User {
  // Mock login - apenas para demonstração
  const user: User = {
    id: '1',
    name: email.split('@')[0],
    email
  };
  localStorage.setItem('logitrack_user', JSON.stringify(user));
  return user;
}

export function register(name: string, email: string, password: string): User {
  // Mock register - apenas para demonstração
  const user: User = {
    id: Date.now().toString(),
    name,
    email
  };
  localStorage.setItem('logitrack_user', JSON.stringify(user));
  return user;
}

export function logout() {
  localStorage.removeItem('logitrack_user');
}
