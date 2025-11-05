// src/components/queries/EmergencyUnit.jsx

'use client';
import { useState, useEffect } from 'react';

export default function EmergencyUnit() {
  const [doctors, setDoctors] = useState([]);
  const [emergencies, setEmergencies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [newEmergency, setNewEmergency] = useState({
    patientId: '',
    doctorId: '',
    severity: 'medium',
    description: ''
  });

  useEffect(() => {
    fetchEmergencyData();
  }, []);

  const fetchEmergencyData = async () => {
    setLoading(true);
    try {
      const [doctorsRes, emergenciesRes] = await Promise.all([
        fetch('/api/users?role=doctor'),
        fetch('/api/queries/emergency-unit')
      ]);

      const doctorsData = await doctorsRes.json();
      const emergenciesData = await emergenciesRes.json();

      setDoctors(doctorsData);
      setEmergencies(emergenciesData);
    } catch (error) {
      console.error('Error fetching emergency data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateEmergency = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/emergencies', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newEmergency),
      });

      if (response.ok) {
        setNewEmergency({
          patientId: '',
          doctorId: '',
          severity: 'medium',
          description: ''
        });
        fetchEmergencyData();
        alert('Emergency case created successfully!');
      }
    } catch (error) {
      console.error('Error creating emergency:', error);
      alert('Error creating emergency case');
    }
  };

  const getDoctorTypeColor = (type) => {
    return type === 'in-house' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800';
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'critical': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-6">⚡ Emergency Unit Management</h2>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Emergency Doctors */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold">Available Emergency Doctors</h3>
            <p className="text-sm text-gray-600">In-house and on-call doctors</p>
          </div>
          
          <div className="p-6">
            <div className="space-y-4">
              {doctors.map((doctor) => (
                <div key={doctor._id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div>
                    <h4 className="font-semibold">Dr. {doctor.name}</h4>
                    <p className="text-sm text-gray-600">{doctor.specialization}</p>
                    <p className="text-xs text-gray-500">{doctor.department}</p>
                  </div>
                  <div className="text-right">
                    <span className={`px-2 py-1 rounded-full text-xs ${getDoctorTypeColor(doctor.type)}`}>
                      {doctor.type}
                    </span>
                    <p className="text-sm text-gray-600 mt-1">{doctor.contact}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Create New Emergency */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold">Create New Emergency Case</h3>
          </div>
          
          <form onSubmit={handleCreateEmergency} className="p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Patient ID
              </label>
              <input
                type="text"
                value={newEmergency.patientId}
                onChange={(e) => setNewEmergency({...newEmergency, patientId: e.target.value})}
                className="w-full p-2 border border-gray-300 rounded-lg"
                placeholder="Enter Patient ID"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Assign Doctor
              </label>
              <select
                value={newEmergency.doctorId}
                onChange={(e) => setNewEmergency({...newEmergency, doctorId: e.target.value})}
                className="w-full p-2 border border-gray-300 rounded-lg"
                required
              >
                <option value="">Select a doctor</option>
                {doctors.map((doctor) => (
                  <option key={doctor._id} value={doctor._id}>
                    Dr. {doctor.name} - {doctor.specialization} ({doctor.type})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Severity Level
              </label>
              <select
                value={newEmergency.severity}
                onChange={(e) => setNewEmergency({...newEmergency, severity: e.target.value})}
                className="w-full p-2 border border-gray-300 rounded-lg"
                required
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="critical">Critical</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Emergency Description
              </label>
              <textarea
                value={newEmergency.description}
                onChange={(e) => setNewEmergency({...newEmergency, description: e.target.value})}
                className="w-full p-2 border border-gray-300 rounded-lg"
                rows="3"
                placeholder="Describe the emergency situation..."
                required
              />
            </div>

            <button
              type="submit"
              className="w-full bg-red-500 text-white py-2 px-4 rounded-lg hover:bg-red-600 transition-colors"
            >
              Create Emergency Case
            </button>
          </form>
        </div>
      </div>

      {/* Active Emergencies */}
      <div className="mt-6 bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold">Active Emergency Cases</h3>
          <p className="text-sm text-gray-600">Currently ongoing emergency situations</p>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Case ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Patient
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Assigned Doctor
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Severity
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Time
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {emergencies.filter(e => e.status === 'active').map((emergency) => (
                <tr key={emergency._id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {emergency.emergencyId}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {emergency.patientId?.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    Dr. {emergency.doctorId?.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span className={`px-2 py-1 rounded-full text-xs ${getSeverityColor(emergency.severity)}`}>
                      {emergency.severity}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {new Date(emergency.emergencyDate).toLocaleTimeString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <button className="text-blue-600 hover:text-blue-900 mr-3">
                      Update
                    </button>
                    <button className="text-green-600 hover:text-green-900">
                      Resolve
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {emergencies.filter(e => e.status === 'active').length === 0 && (
            <div className="text-center py-8">
              <p className="text-gray-500">No active emergency cases</p>
            </div>
          )}
        </div>
      </div>

      {loading && (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading emergency unit data...</p>
        </div>
      )}
    </div>
  );
}