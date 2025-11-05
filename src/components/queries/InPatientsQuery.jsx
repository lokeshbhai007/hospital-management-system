// src/components/queries/InPatientsQuery.jsx

'use client';
import { useState, useEffect } from 'react';

export default function InPatientsQuery() {
  const [doctors, setDoctors] = useState([]);
  const [selectedDoctor, setSelectedDoctor] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchDoctors();
    fetchInPatients();
  }, []);

  useEffect(() => {
    if (selectedDoctor) {
      fetchInPatients();
    }
  }, [selectedDoctor]);

  const fetchDoctors = async () => {
    try {
      const response = await fetch('/api/users?role=doctor');
      if (response.ok) {
        const data = await response.json();
        setDoctors(data);
        console.log('Fetched doctors:', data.length);
      } else {
        setError('Failed to fetch doctors');
      }
    } catch (error) {
      console.error('Error fetching doctors:', error);
      setError('Error fetching doctors');
    }
  };

  const fetchInPatients = async () => {
    setLoading(true);
    setError('');
    try {
      const url = selectedDoctor 
        ? `/api/queries/in-patients?doctorId=${selectedDoctor}`
        : '/api/queries/in-patients';
      
      console.log('Fetching from URL:', url);
      
      const response = await fetch(url);
      const data = await response.json();
      
      console.log('Fetched in-patients:', data);
      
      if (Array.isArray(data)) {
        setResults(data);
      } else {
        setError('Invalid data format received');
        setResults([]);
      }
    } catch (error) {
      console.error('Error fetching in-patients:', error);
      setError('Error fetching in-patient data');
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    return status === 'admitted' ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800';
  };

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-6">🏥 In-Patients Under Doctor Vigilance</h2>
      
      <div className="bg-white p-6 rounded-lg shadow mb-6">
        <h3 className="text-lg font-semibold mb-4">Filter Criteria</h3>
        <div className="flex space-x-4 items-end">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Doctor</label>
            <select
              value={selectedDoctor}
              onChange={(e) => setSelectedDoctor(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-lg"
            >
              <option value="">All Doctors</option>
              {doctors.map((doctor) => (
                <option key={doctor._id} value={doctor._id}>
                  Dr. {doctor.name} - {doctor.specialization}
                </option>
              ))}
            </select>
          </div>
          <div>
            <button
              onClick={fetchInPatients}
              disabled={loading}
              className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50"
            >
              {loading ? 'Refreshing...' : 'Refresh'}
            </button>
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
          {error}
        </div>
      )}

      {/* Results */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold">In-Patient Details</h3>
          <p className="text-sm text-gray-600">
            {selectedDoctor ? 'Patients under selected doctor' : 'All current in-patients'}
            {selectedDoctor && doctors.find(d => d._id === selectedDoctor) && 
              ` - Dr. ${doctors.find(d => d._id === selectedDoctor)?.name}`
            }
          </p>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Admission ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Patient
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Doctor
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Admission Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Room
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Illness
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Treatment
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {results.map((inPatient) => (
                <tr key={inPatient._id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {inPatient.admissionId}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <div>
                      <div className="font-medium">{inPatient.patientId?.name || 'Unknown Patient'}</div>
                      <div className="text-xs text-gray-500">{inPatient.patientId?.userId || 'N/A'}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <div>
                      <div className="font-medium">Dr. {inPatient.doctorId?.name || 'Unknown Doctor'}</div>
                      <div className="text-xs text-gray-500">{inPatient.doctorId?.specialization || 'N/A'}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {inPatient.admissionDate ? new Date(inPatient.admissionDate).toLocaleDateString() : 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {inPatient.roomNumber}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {inPatient.illness}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {inPatient.treatment}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(inPatient.status)}`}>
                      {inPatient.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {results.length === 0 && !loading && (
            <div className="text-center py-8">
              <p className="text-gray-500">No in-patients found</p>
              <p className="text-sm text-gray-400 mt-1">
                {selectedDoctor ? 'No patients currently admitted under this doctor' : 'No patients currently admitted'}
              </p>
            </div>
          )}
          
          {loading && (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2 text-gray-600">Loading in-patients...</p>
            </div>
          )}
        </div>
      </div>

      {/* Debug Info */}
      <div className="mt-4 p-4 bg-gray-100 rounded-lg">
        <h4 className="text-sm font-medium text-gray-700 mb-2">Debug Info:</h4>
        <p className="text-xs text-gray-600">Selected Doctor ID: {selectedDoctor || 'None'}</p>
        <p className="text-xs text-gray-600">Results Count: {results.length}</p>
        <p className="text-xs text-gray-600">Loading: {loading ? 'Yes' : 'No'}</p>
      </div>
    </div>
  );
}