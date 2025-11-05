// src/components/InPatientManagement.jsx

'use client';
import { useState, useEffect } from 'react';

export default function InPatientManagement() {
  const [inPatients, setInPatients] = useState([]);
  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState('');

  const [formData, setFormData] = useState({
    patientId: '',
    doctorId: '',
    admissionDate: '',
    roomNumber: '',
    illness: '',
    treatment: '',
    medication: ['']
  });

  useEffect(() => {
    fetchInPatients();
    fetchPatients();
    fetchDoctors();
  }, []);

  const fetchInPatients = async (doctorId = '') => {
    try {
      let url = '/api/inpatients';
      if (doctorId) {
        url += `?doctorId=${doctorId}`;
      }

      const response = await fetch(url);
      const data = await response.json();
      setInPatients(data);
    } catch (error) {
      console.error('Error fetching in-patients:', error);
    }
  };

  const fetchPatients = async () => {
    try {
      const response = await fetch('/api/patients');
      const data = await response.json();
      setPatients(data);
    } catch (error) {
      console.error('Error fetching patients:', error);
    }
  };

  const fetchDoctors = async () => {
    try {
      const response = await fetch('/api/doctors');
      const data = await response.json();
      setDoctors(data);
    } catch (error) {
      console.error('Error fetching doctors:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/inpatients', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          medication: formData.medication.filter(med => med.trim() !== '')
        }),
      });

      if (response.ok) {
        setShowForm(false);
        setFormData({
          patientId: '',
          doctorId: '',
          admissionDate: '',
          roomNumber: '',
          illness: '',
          treatment: '',
          medication: ['']
        });
        fetchInPatients();
      }
    } catch (error) {
      console.error('Error admitting patient:', error);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleMedicationChange = (index, value) => {
    const newMedication = [...formData.medication];
    newMedication[index] = value;
    setFormData({
      ...formData,
      medication: newMedication
    });
  };

  const addMedicationField = () => {
    setFormData({
      ...formData,
      medication: [...formData.medication, '']
    });
  };

  const handleFilter = () => {
    fetchInPatients(selectedDoctor);
  };

  const handleClearFilter = () => {
    setSelectedDoctor('');
    fetchInPatients();
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">In-Patient Management</h1>
        <button
          onClick={() => setShowForm(true)}
          className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
        >
          Admit Patient
        </button>
      </div>

      {/* Filter Section */}
      <div className="bg-white p-4 rounded-lg shadow mb-6">
        <h3 className="text-lg font-semibold mb-4">Filter In-Patients</h3>
        <div className="flex space-x-4">
          <select
            value={selectedDoctor}
            onChange={(e) => setSelectedDoctor(e.target.value)}
            className="p-2 border rounded-lg flex-1"
          >
            <option value="">Select Doctor</option>
            {doctors.map((doctor) => (
              <option key={doctor._id} value={doctor._id}>
                {doctor.name} - {doctor.specialization}
              </option>
            ))}
          </select>
          <button
            onClick={handleFilter}
            className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
          >
            Apply Filter
          </button>
          <button
            onClick={handleClearFilter}
            className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors"
          >
            Clear
          </button>
        </div>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-screen overflow-y-auto">
            <h2 className="text-xl font-semibold mb-4">Admit Patient</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <select
                  name="patientId"
                  value={formData.patientId}
                  onChange={handleChange}
                  className="w-full p-2 border rounded-lg"
                  required
                >
                  <option value="">Select Patient</option>
                  {patients.map((patient) => (
                    <option key={patient._id} value={patient._id}>
                      {patient.name} ({patient.patientId})
                    </option>
                  ))}
                </select>
                <select
                  name="doctorId"
                  value={formData.doctorId}
                  onChange={handleChange}
                  className="w-full p-2 border rounded-lg"
                  required
                >
                  <option value="">Select Doctor</option>
                  {doctors.map((doctor) => (
                    <option key={doctor._id} value={doctor._id}>
                      {doctor.name} - {doctor.specialization}
                    </option>
                  ))}
                </select>
                <input
                  type="date"
                  name="admissionDate"
                  value={formData.admissionDate}
                  onChange={handleChange}
                  className="w-full p-2 border rounded-lg"
                  required
                />
                <input
                  type="text"
                  name="roomNumber"
                  placeholder="Room Number"
                  value={formData.roomNumber}
                  onChange={handleChange}
                  className="w-full p-2 border rounded-lg"
                  required
                />
              </div>
              <textarea
                name="illness"
                placeholder="Illness/Diagnosis"
                value={formData.illness}
                onChange={handleChange}
                className="w-full p-2 border rounded-lg"
                rows="3"
                required
              />
              <textarea
                name="treatment"
                placeholder="Treatment Plan"
                value={formData.treatment}
                onChange={handleChange}
                className="w-full p-2 border rounded-lg"
                rows="3"
                required
              />
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Medication
                </label>
                {formData.medication.map((med, index) => (
                  <input
                    key={index}
                    type="text"
                    value={med}
                    onChange={(e) => handleMedicationChange(index, e.target.value)}
                    placeholder={`Medication ${index + 1}`}
                    className="w-full p-2 border rounded-lg mb-2"
                  />
                ))}
                <button
                  type="button"
                  onClick={addMedicationField}
                  className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors"
                >
                  Add Medication
                </button>
              </div>
              <div className="flex space-x-2">
                <button
                  type="submit"
                  className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
                >
                  Admit Patient
                </button>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="bg-white shadow rounded-lg">
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
                Status
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {inPatients.map((inPatient) => (
              <tr key={inPatient._id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {inPatient.admissionId}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {inPatient.patientId?.name}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {inPatient.doctorId?.name}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {new Date(inPatient.admissionDate).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {inPatient.roomNumber}
                </td>
                <td className="px-6 py-4 text-sm text-gray-900">
                  {inPatient.illness}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    inPatient.status === 'admitted' 
                      ? 'bg-yellow-100 text-yellow-800' 
                      : 'bg-green-100 text-green-800'
                  }`}>
                    {inPatient.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}