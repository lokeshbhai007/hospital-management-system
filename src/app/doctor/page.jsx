// src/app/doctor/page.js

'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import DoctorDashboard from '@/components/DoctorDashboard';

export default function DoctorPage() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const verifyUser = async () => {
      try {
        const response = await fetch('/api/auth/me');
        
        if (response.ok) {
          const userData = await response.json();
          
          if (userData.role !== 'doctor') {
            router.push('/unauthorized');
            return;
          }
          
          setUser(userData);
        } else {
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
    return null;
  }

  return <DoctorDashboard user={user} onLogout={handleLogout} />;
}