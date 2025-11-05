// src/components/BillingManagement.jsx

'use client';
import { useState, useEffect } from 'react';

export default function BillingManagement() {
  const [bills, setBills] = useState([]);
  const [patients, setPatients] = useState([]);
  const [revenueData, setRevenueData] = useState({ totalRevenue: 0, totalBills: 0 });
  const [dateRange, setDateRange] = useState({
    start: '2024-01-01',
    end: new Date().toISOString().split('T')[0]
  });

  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    patientId: '',
    amount: '',
    paymentMethod: 'cash',
    services: [{ serviceName: '', cost: '' }],
    status: 'pending'
  });

  useEffect(() => {
    fetchBills();
    fetchPatients();
    fetchRevenue();
  }, []);

  const fetchBills = async () => {
    try {
      const response = await fetch('/api/billing');
      const data = await response.json();
      setBills(data);
    } catch (error) {
      console.error('Error fetching bills:', error);
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

  const fetchRevenue = async () => {
    try {
      const response = await fetch(`/api/revenue/range?start=${dateRange.start}&end=${dateRange.end}`);
      const data = await response.json();
      setRevenueData(data);
    } catch (error) {
      console.error('Error fetching revenue:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const totalAmount = formData.services.reduce((sum, service) => sum + parseFloat(service.cost || 0), 0);
      
      const response = await fetch('/api/billing', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          amount: totalAmount,
          services: formData.services.filter(service => service.serviceName.trim() !== '')
        }),
      });

      if (response.ok) {
        setShowForm(false);
        setFormData({
          patientId: '',
          amount: '',
          paymentMethod: 'cash',
          services: [{ serviceName: '', cost: '' }],
          status: 'pending'
        });
        fetchBills();
        fetchRevenue();
      }
    } catch (error) {
      console.error('Error creating bill:', error);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleServiceChange = (index, field, value) => {
    const newServices = [...formData.services];
    newServices[index][field] = value;
    setFormData({
      ...formData,
      services: newServices
    });
  };

  const addServiceField = () => {
    setFormData({
      ...formData,
      services: [...formData.services, { serviceName: '', cost: '' }]
    });
  };

  const handleDateRangeChange = () => {
    fetchRevenue();
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Billing & Revenue Management</h1>
        <button
          onClick={() => setShowForm(true)}
          className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
        >
          Create Bill
        </button>
      </div>

      {/* Revenue Summary */}
      <div className="bg-white p-6 rounded-lg shadow mb-6">
        <h3 className="text-xl font-semibold mb-4">Revenue Summary</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-4">
          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="text-sm font-medium text-blue-800">Total Revenue</h4>
            <p className="text-2xl font-bold text-blue-900">${revenueData.totalRevenue}</p>
          </div>
          <div className="bg-green-50 p-4 rounded-lg">
            <h4 className="text-sm font-medium text-green-800">Total Bills</h4>
            <p className="text-2xl font-bold text-green-900">{revenueData.totalBills}</p>
          </div>
          <div className="bg-purple-50 p-4 rounded-lg">
            <h4 className="text-sm font-medium text-purple-800">Average Bill</h4>
            <p className="text-2xl font-bold text-purple-900">
              ${revenueData.totalBills > 0 ? (revenueData.totalRevenue / revenueData.totalBills).toFixed(2) : '0.00'}
            </p>
          </div>
        </div>
        
        <div className="flex space-x-4 items-end">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
            <input
              type="date"
              value={dateRange.start}
              onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
              className="p-2 border rounded-lg"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
            <input
              type="date"
              value={dateRange.end}
              onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
              className="p-2 border rounded-lg"
            />
          </div>
          <button
            onClick={handleDateRangeChange}
            className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors h-fit"
          >
            Update
          </button>
        </div>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-screen overflow-y-auto">
            <h2 className="text-xl font-semibold mb-4">Create Bill</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
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
                name="paymentMethod"
                value={formData.paymentMethod}
                onChange={handleChange}
                className="w-full p-2 border rounded-lg"
                required
              >
                <option value="cash">Cash</option>
                <option value="card">Card</option>
                <option value="insurance">Insurance</option>
              </select>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Services
                </label>
                {formData.services.map((service, index) => (
                  <div key={index} className="flex space-x-2 mb-2">
                    <input
                      type="text"
                      placeholder="Service Name"
                      value={service.serviceName}
                      onChange={(e) => handleServiceChange(index, 'serviceName', e.target.value)}
                      className="flex-1 p-2 border rounded-lg"
                    />
                    <input
                      type="number"
                      placeholder="Cost"
                      value={service.cost}
                      onChange={(e) => handleServiceChange(index, 'cost', e.target.value)}
                      className="w-32 p-2 border rounded-lg"
                    />
                  </div>
                ))}
                <button
                  type="button"
                  onClick={addServiceField}
                  className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors"
                >
                  Add Service
                </button>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-semibold">Total Amount: $
                  {formData.services.reduce((sum, service) => sum + parseFloat(service.cost || 0), 0).toFixed(2)}
                </h4>
              </div>

              <div className="flex space-x-2">
                <button
                  type="submit"
                  className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
                >
                  Create Bill
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
                Bill ID
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Patient
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Amount
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Payment Method
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Payment Date
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {bills.map((bill) => (
              <tr key={bill._id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {bill.billId}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {bill.patientId?.name}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  ${bill.amount}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {bill.paymentMethod}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {new Date(bill.paymentDate).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    bill.status === 'paid' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {bill.status}
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