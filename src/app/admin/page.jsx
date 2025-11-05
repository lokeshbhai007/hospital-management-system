// src/app/admin/page.js

'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AdminDashboard from '@/components/AdminDashboard';

export default function AdminPage() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const verifyUser = async () => {
      try {
        console.log('Verifying user authentication...');
        const response = await fetch('/api/auth/me');
        
        if (response.ok) {
          const userData = await response.json();
          console.log('User verified:', userData.role);
          
          if (userData.role !== 'admin') {
            console.log('User is not admin, redirecting...');
            router.push('/unauthorized');
            return;
          }
          
          setUser(userData);
        } else {
          console.log('Auth failed, redirecting to login');
          router.push('/login');
        }
      } catch (error) {
        console.error('Auth verification error:', error);
        router.push('/login');
      } finally {
        setLoading(false);
      }
    };

    verifyUser();
  }, [router]);

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Force reload to clear any cached state
      window.location.href = '/login';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect due to useEffect
  }

  return <AdminDashboard user={user} onLogout={handleLogout} />;
}