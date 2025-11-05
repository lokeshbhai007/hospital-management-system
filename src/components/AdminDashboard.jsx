// src/components/AdminDashboard.jsx

'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function AdminDashboard({ user, onLogout }) {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [stats, setStats] = useState({
    totalPatients: 0,
    totalDoctors: 0,
    totalAppointments: 0,
    totalRevenue: 0,
    pendingAppointments: 0
  });
  const [users, setUsers] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [billing, setBilling] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    try {
      setLoading(true);
      console.log('Fetching all data for admin dashboard...');
      
      const [usersRes, appointmentsRes, billingRes] = await Promise.all([
        fetch('/api/users'),
        fetch('/api/appointments'),
        fetch('/api/billing')
      ]);

      let usersData = [];
      let appointmentsData = [];
      let billingData = [];

      if (usersRes.ok) {
        usersData = await usersRes.json();
        console.log('Users data:', usersData);
      } else {
        console.error('Failed to fetch users:', usersRes.status);
      }

      if (appointmentsRes.ok) {
        appointmentsData = await appointmentsRes.json();
        console.log('Appointments data:', appointmentsData);
      } else {
        console.error('Failed to fetch appointments:', appointmentsRes.status);
      }

      if (billingRes.ok) {
        billingData = await billingRes.json();
        console.log('Billing data:', billingData);
      } else {
        console.error('Failed to fetch billing:', billingRes.status);
      }

      // Calculate stats - FIXED LOGIC
      const patients = usersData.filter(u => u.role === 'patient');
      const doctors = usersData.filter(u => u.role === 'doctor');
      const pendingAppointments = appointmentsData.filter(a => a.status === 'pending');
      const totalRevenue = billingData.reduce((sum, bill) => sum + (bill.amount || 0), 0);

      console.log('Calculated stats:', {
        patients: patients.length,
        doctors: doctors.length,
        appointments: appointmentsData.length,
        revenue: totalRevenue,
        pending: pendingAppointments.length
      });

      setStats({
        totalPatients: patients.length,
        totalDoctors: doctors.length,
        totalAppointments: appointmentsData.length,
        totalRevenue: totalRevenue,
        pendingAppointments: pendingAppointments.length
      });

      setUsers(usersData);
      setAppointments(appointmentsData);
      setBilling(billingData);
      
    } catch (error) {
      console.error('Error in fetchAllData:', error);
    } finally {
      setLoading(false);
    }
  };

  const deleteUser = async (userId) => {
    if (confirm('Are you sure you want to delete this user?')) {
      try {
        const response = await fetch(`/api/users/${userId}`, {
          method: 'DELETE'
        });

        if (response.ok) {
          fetchAllData();
        } else {
          alert('Error deleting user');
        }
      } catch (error) {
        console.error('Error deleting user:', error);
        alert('Error deleting user');
      }
    }
  };

  const tabs = [
    { id: 'dashboard', name: 'Dashboard' },
    { id: 'users', name: 'User Management' },
    { id: 'appointments', name: 'Appointments' },
    { id: 'reports', name: 'Reports' },
    { id: 'queries', name: 'Analytics' } // Added Analytics tab
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard data...</p>
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
                Admin Dashboard
              </h1>
              <p className="text-gray-600">Welcome, {user?.name}</p>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-gray-700">{user?.userId}</span>
              
              {/* Analytics Button */}
              <Link 
                href="/admin/queries" 
                className="bg-purple-500 text-white px-4 py-2 rounded-lg hover:bg-purple-600 transition-colors"
              >
                View Analytics
              </Link>
              
              <button
                onClick={onLogout}
                className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-1 border-b-2 font-medium text-sm capitalize ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.name}
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'dashboard' && (
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-8">Admin Dashboard</h1>
            
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="p-3 bg-blue-100 rounded-lg">
                    <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <h3 className="text-sm font-medium text-gray-500">Total Patients</h3>
                    <p className="text-2xl font-semibold text-gray-900">{stats.totalPatients}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="p-3 bg-green-100 rounded-lg">
                    <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <h3 className="text-sm font-medium text-gray-500">Total Doctors</h3>
                    <p className="text-2xl font-semibold text-gray-900">{stats.totalDoctors}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="p-3 bg-purple-100 rounded-lg">
                    <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <h3 className="text-sm font-medium text-gray-500">Appointments</h3>
                    <p className="text-2xl font-semibold text-gray-900">{stats.totalAppointments}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="p-3 bg-yellow-100 rounded-lg">
                    <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <h3 className="text-sm font-medium text-gray-500">Total Revenue</h3>
                    <p className="text-2xl font-semibold text-gray-900">₹{stats.totalRevenue}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-lg shadow p-6 mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Link
                  href="/admin?tab=users"
                  className="bg-blue-500 text-white px-4 py-3 rounded-lg hover:bg-blue-600 transition-colors text-center"
                >
                  Manage Users
                </Link>
                <Link
                  href="/admin?tab=appointments"
                  className="bg-green-500 text-white px-4 py-3 rounded-lg hover:bg-green-600 transition-colors text-center"
                >
                  View Appointments
                </Link>
                <Link
                  href="/admin?tab=reports"
                  className="bg-purple-500 text-white px-4 py-3 rounded-lg hover:bg-purple-600 transition-colors text-center"
                >
                  Generate Reports
                </Link>
                <Link
                  href="/admin/queries"
                  className="bg-indigo-500 text-white px-4 py-3 rounded-lg hover:bg-indigo-600 transition-colors text-center"
                >
                  Advanced Analytics
                </Link>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold mb-4">Recent Appointments</h3>
                <div className="space-y-3">
                  {appointments.slice(0, 5).map((appointment) => (
                    <div key={appointment._id} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                      <div>
                        <p className="font-medium">{appointment.patientId?.name || 'Unknown Patient'}</p>
                        <p className="text-sm text-gray-600">with Dr. {appointment.doctorId?.name || 'Unknown Doctor'}</p>
                      </div>
                      <span className={`px-2 py-1 rounded text-xs ${
                        appointment.status === 'approved' ? 'bg-green-100 text-green-800' :
                        appointment.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        appointment.status === 'rejected' ? 'bg-red-100 text-red-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {appointment.status}
                      </span>
                    </div>
                  ))}
                  {appointments.length === 0 && (
                    <p className="text-gray-500 text-center py-4">No appointments found</p>
                  )}
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold mb-4">System Overview</h3>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span>Pending Approvals</span>
                    <span className="font-semibold">{stats.pendingAppointments}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Active Doctors</span>
                    <span className="font-semibold">{stats.totalDoctors}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Registered Patients</span>
                    <span className="font-semibold">{stats.totalPatients}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Today's Appointments</span>
                    <span className="font-semibold">
                      {appointments.filter(a => {
                        const appointmentDate = new Date(a.date);
                        const today = new Date();
                        return appointmentDate.toDateString() === today.toDateString();
                      }).length}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Total Revenue</span>
                    <span className="font-semibold">₹{stats.totalRevenue}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'users' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">User Management</h2>
              <button
                onClick={fetchAllData}
                className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
              >
                Refresh Data
              </button>
            </div>

            <div className="bg-white shadow rounded-lg">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      User ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Role
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Email
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Contact
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {users.map((user) => (
                    <tr key={user._id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {user.userId}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {user.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          user.role === 'admin' ? 'bg-purple-100 text-purple-800' :
                          user.role === 'doctor' ? 'bg-green-100 text-green-800' :
                          'bg-blue-100 text-blue-800'
                        }`}>
                          {user.role}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {user.email}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {user.contact || 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {user.role !== 'admin' && (
                          <button
                            onClick={() => deleteUser(user._id)}
                            className="text-red-600 hover:text-red-900"
                          >
                            Delete
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {users.length === 0 && (
                <div className="text-center py-8">
                  <p className="text-gray-500">No users found</p>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'appointments' && (
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">All Appointments</h2>

            <div className="bg-white shadow rounded-lg">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Appointment ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Patient
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Doctor
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date & Time
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {appointments.map((appointment) => (
                    <tr key={appointment._id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {appointment.appointmentId}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {appointment.patientId?.name || 'Unknown Patient'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        Dr. {appointment.doctorId?.name || 'Unknown Doctor'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {appointment.date ? new Date(appointment.date).toLocaleDateString() : 'N/A'} {appointment.time}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {appointment.type}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          appointment.status === 'approved' ? 'bg-green-100 text-green-800' :
                          appointment.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          appointment.status === 'rejected' ? 'bg-red-100 text-red-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {appointment.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {appointments.length === 0 && (
                <div className="text-center py-8">
                  <p className="text-gray-500">No appointments found</p>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'reports' && (
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Reports & Analytics</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-lg font-semibold mb-4">Revenue Report</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Total Revenue</span>
                    <span className="font-semibold">₹{stats.totalRevenue}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Total Bills</span>
                    <span className="font-semibold">{billing.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Average Bill Amount</span>
                    <span className="font-semibold">
                      ₹{billing.length > 0 ? Math.round(stats.totalRevenue / billing.length) : 0}
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-lg font-semibold mb-4">User Statistics</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Total Users</span>
                    <span className="font-semibold">{users.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Patients</span>
                    <span className="font-semibold">{stats.totalPatients}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Doctors</span>
                    <span className="font-semibold">{stats.totalDoctors}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Admins</span>
                    <span className="font-semibold">{users.filter(u => u.role === 'admin').length}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Additional Reports */}
            <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-lg font-semibold mb-4">Appointment Status</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Approved</span>
                    <span className="font-semibold">
                      {appointments.filter(a => a.status === 'approved').length}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Pending</span>
                    <span className="font-semibold">{stats.pendingAppointments}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Rejected</span>
                    <span className="font-semibold">
                      {appointments.filter(a => a.status === 'rejected').length}
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-lg font-semibold mb-4">Doctor Specializations</h3>
                <div className="space-y-2">
                  {Object.entries(
                    users
                      .filter(u => u.role === 'doctor')
                      .reduce((acc, doctor) => {
                        const spec = doctor.specialization || 'General';
                        acc[spec] = (acc[spec] || 0) + 1;
                        return acc;
                      }, {})
                  ).map(([spec, count]) => (
                    <div key={spec} className="flex justify-between">
                      <span>{spec}</span>
                      <span className="font-semibold">{count}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-lg font-semibold mb-4">Payment Methods</h3>
                <div className="space-y-2">
                  {Object.entries(
                    billing.reduce((acc, bill) => {
                      const method = bill.paymentMethod || 'unknown';
                      acc[method] = (acc[method] || 0) + 1;
                      return acc;
                    }, {})
                  ).map(([method, count]) => (
                    <div key={method} className="flex justify-between">
                      <span className="capitalize">{method}</span>
                      <span className="font-semibold">{count}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Advanced Analytics Link */}
            <div className="mt-8 bg-gradient-to-r from-purple-500 to-indigo-600 rounded-lg shadow-lg p-6 text-center">
              <h3 className="text-xl font-semibold text-white mb-2">Need More Detailed Analytics?</h3>
              <p className="text-purple-100 mb-4">
                Access advanced queries, revenue trends, emergency case analysis, and more detailed reports.
              </p>
              <Link
                href="/admin/queries"
                className="inline-block bg-white text-purple-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
              >
                Go to Advanced Analytics →
              </Link>
            </div>
          </div>
        )}

        {activeTab === 'queries' && (
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Advanced Analytics</h2>
            
            <div className="bg-white rounded-lg shadow p-6 mb-6">
              <h3 className="text-lg font-semibold mb-4">Data Analytics & Queries</h3>
              <p className="text-gray-600 mb-4">
                Access comprehensive analytics and run advanced queries on hospital data including:
              </p>
              <ul className="grid grid-cols-1 md:grid-cols-2 gap-3 text-gray-700">
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-blue-500 rounded-full mr-3"></span>
                  Doctor-Patient Relationship Analysis
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-green-500 rounded-full mr-3"></span>
                  In-Patient Management Reports
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-purple-500 rounded-full mr-3"></span>
                  Revenue Analytics (Weekly/Monthly/Yearly)
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-red-500 rounded-full mr-3"></span>
                  Emergency Case Analysis
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-orange-500 rounded-full mr-3"></span>
                  Emergency Unit Management
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-indigo-500 rounded-full mr-3"></span>
                  Custom Date Range Queries
                </li>
              </ul>
            </div>

            <div className="text-center">
              <Link
                href="/admin/queries"
                className="inline-block bg-gradient-to-r from-purple-500 to-indigo-600 text-white px-8 py-4 rounded-lg font-semibold hover:from-purple-600 hover:to-indigo-700 transition-colors text-lg"
              >
                Launch Analytics Dashboard
              </Link>
              <p className="text-gray-500 mt-3">
                Opens in a new dedicated analytics interface
              </p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}