"use client";
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { fetcher, Customer } from './api';

export type Role = 'admin' | 'customer';

export interface User {
  role: Role;
  name?: string;
  email?: string;
  id?: string;
  phone?: string;
}

interface AuthContextType {
  user: User | null;
  role: Role | null;
  isLoading: boolean;
  login: (credentials: any) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem('restock_user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {
        console.error("Failed to parse stored user", e);
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (credentials: any) => {
    setIsLoading(true);
    try {
      if (credentials.type === 'admin') {
        if (credentials.email === 'admin@restock.app' && credentials.password === 'admin123') {
          const adminUser: User = { role: 'admin', name: 'Admin User', email: 'admin@restock.app' };
          localStorage.setItem('restock_user', JSON.stringify(adminUser));
          setUser(adminUser);
        } else {
          throw new Error('Invalid credentials');
        }
      } else if (credentials.type === 'customer') {
        const customers = await fetcher<Customer[]>('/customers');
        const customer = customers.find(c => c.phone === credentials.phone);
        if (customer) {
          const customerUser: User = { role: 'customer', id: customer.id, name: customer.name, phone: customer.phone };
          localStorage.setItem('restock_user', JSON.stringify(customerUser));
          setUser(customerUser);
        } else {
          throw new Error('No account found with this phone number. Contact admin.');
        }
      }
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('restock_user');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, role: user?.role || null, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
