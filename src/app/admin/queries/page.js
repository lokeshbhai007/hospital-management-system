// src/app/admin/queries/page.js


'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import DoctorPatientsQuery from '@/components/queries/DoctorPatientsQuery';
import InPatientsQuery from '@/components/queries/InPatientsQuery';
import RevenueQuery from '@/components/queries/RevenueQuery';
import EmergenciesQuery from '@/components/queries/EmergenciesQuery';
import EmergencyUnit from '@/components/queries/EmergencyUnit';

export default function QueriesPage() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeQuery, setActiveQuery] = useState('doctor-patients');
  const router = useRouter();

  useEffect(() => {
    const verifyUser = async () => {
      try {
        const response = await fetch('/api/auth/me');
        if (response.ok) {
          const userData = await response.json();
          if (userData.role !== 'admin') {
            router.push('/unauthorized');
            return;
          }
          setUser(userData);
        } else {
          router.push('/login');
        }
      } catch (error) {
        router.push('/login');
      } finally {
        setLoading(false);
      }
    };

    verifyUser();
  }, [router]);

  const queries = [
    { id: 'doctor-patients', name: 'Doctor-Patient Relationships', icon: '👥' },
    { id: 'in-patients', name: 'In-Patient Management', icon: '🏥' },
    { id: 'revenue', name: 'Revenue Analytics', icon: '💰' },
    { id: 'emergencies', name: 'Emergency Cases', icon: '🚨' },
    { id: 'emergency-unit', name: 'Emergency Unit', icon: '⚡' }
  ];

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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Analytics & Queries
              </h1>
              <p className="text-gray-600">Advanced hospital data analysis</p>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.push('/admin')}
                className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
              >
                Back to Dashboard
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8 overflow-x-auto">
            {queries.map((query) => (
              <button
                key={query.id}
                onClick={() => setActiveQuery(query.id)}
                className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                  activeQuery === query.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <span className="mr-2">{query.icon}</span>
                {query.name}
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeQuery === 'doctor-patients' && <DoctorPatientsQuery />}
        {activeQuery === 'in-patients' && <InPatientsQuery />}
        {activeQuery === 'revenue' && <RevenueQuery />}
        {activeQuery === 'emergencies' && <EmergenciesQuery />}
        {activeQuery === 'emergency-unit' && <EmergencyUnit />}
      </main>
    </div>
  );
}