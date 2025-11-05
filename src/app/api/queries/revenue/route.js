// src/app/api/queries/revenue/route.js

// src/app/api/queries/revenue/route.js

import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Billing from '@/models/Billing';

export async function GET(request) {
  try {
    await dbConnect();
    const { searchParams } = new URL(request.url);
    const start = searchParams.get('start');
    const end = searchParams.get('end');
    const period = searchParams.get('period') || 'monthly';

    if (!start || !end) {
      return NextResponse.json({ error: 'Start and end dates are required' }, { status: 400 });
    }

    const startDate = new Date(start);
    const endDate = new Date(end);
    endDate.setHours(23, 59, 59, 999);

    // Get all bills in date range
    const bills = await Billing.find({
      paymentDate: {
        $gte: startDate,
        $lte: endDate
      }
    });

    // Calculate basic stats
    const totalRevenue = bills.reduce((sum, bill) => sum + (bill.amount || 0), 0);
    const totalBills = bills.length;
    const paidBills = bills.filter(bill => bill.status === 'paid').length;
    const averageBill = totalBills > 0 ? Math.round(totalRevenue / totalBills) : 0;

    // Generate breakdown based on period
    let breakdown = [];
    if (period === 'weekly') {
      breakdown = generateWeeklyBreakdown(bills, startDate, endDate);
    } else if (period === 'monthly') {
      breakdown = generateMonthlyBreakdown(bills, startDate, endDate);
    } else {
      breakdown = generateYearlyBreakdown(bills, startDate, endDate);
    }

    return NextResponse.json({
      totalRevenue,
      totalBills,
      paidBills,
      averageBill,
      [`${period}Breakdown`]: breakdown
    });
  } catch (error) {
    console.error('Error fetching revenue:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

function generateWeeklyBreakdown(bills, startDate, endDate) {
  const breakdown = [];
  let currentDate = new Date(startDate);
  
  while (currentDate <= endDate) {
    const weekStart = new Date(currentDate);
    let weekEnd = new Date(currentDate);
    weekEnd.setDate(weekEnd.getDate() + 6);
    
    if (weekEnd > endDate) weekEnd = new Date(endDate);
    
    const weekBills = bills.filter(bill => {
      const billDate = new Date(bill.paymentDate);
      return billDate >= weekStart && billDate <= weekEnd;
    });
    
    const weekRevenue = weekBills.reduce((sum, bill) => sum + (bill.amount || 0), 0);
    
    breakdown.push({
      period: `Week ${breakdown.length + 1} (${weekStart.toLocaleDateString()})`,
      revenue: weekRevenue,
      bills: weekBills.length,
      average: weekBills.length > 0 ? Math.round(weekRevenue / weekBills.length) : 0,
      growth: breakdown.length > 0 ? calculateGrowth(weekRevenue, breakdown[breakdown.length - 1].revenue) : 0
    });
    
    currentDate.setDate(currentDate.getDate() + 7);
  }
  
  return breakdown;
}

function generateMonthlyBreakdown(bills, startDate, endDate) {
  const breakdown = [];
  let currentDate = new Date(startDate.getFullYear(), startDate.getMonth(), 1);
  
  while (currentDate <= endDate) {
    const monthStart = new Date(currentDate);
    let monthEnd = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
    
    if (monthEnd > endDate) monthEnd = new Date(endDate);
    
    const monthBills = bills.filter(bill => {
      const billDate = new Date(bill.paymentDate);
      return billDate >= monthStart && billDate <= monthEnd;
    });
    
    const monthRevenue = monthBills.reduce((sum, bill) => sum + (bill.amount || 0), 0);
    
    breakdown.push({
      period: monthStart.toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
      revenue: monthRevenue,
      bills: monthBills.length,
      average: monthBills.length > 0 ? Math.round(monthRevenue / monthBills.length) : 0,
      growth: breakdown.length > 0 ? calculateGrowth(monthRevenue, breakdown[breakdown.length - 1].revenue) : 0
    });
    
    currentDate.setMonth(currentDate.getMonth() + 1);
  }
  
  return breakdown;
}

function generateYearlyBreakdown(bills, startDate, endDate) {
  const breakdown = [];
  let currentYear = startDate.getFullYear();
  
  while (currentYear <= endDate.getFullYear()) {
    const yearStart = new Date(currentYear, 0, 1);
    let yearEnd = new Date(currentYear, 11, 31);
    
    if (yearEnd > endDate) yearEnd = new Date(endDate);
    
    const yearBills = bills.filter(bill => {
      const billDate = new Date(bill.paymentDate);
      return billDate >= yearStart && billDate <= yearEnd;
    });
    
    const yearRevenue = yearBills.reduce((sum, bill) => sum + (bill.amount || 0), 0);
    
    breakdown.push({
      period: currentYear.toString(),
      revenue: yearRevenue,
      bills: yearBills.length,
      average: yearBills.length > 0 ? Math.round(yearRevenue / yearBills.length) : 0,
      growth: breakdown.length > 0 ? calculateGrowth(yearRevenue, breakdown[breakdown.length - 1].revenue) : 0
    });
    
    currentYear++;
  }
  
  return breakdown;
}

function calculateGrowth(current, previous) {
  if (previous === 0) return current > 0 ? 100 : 0;
  return Math.round(((current - previous) / previous) * 100);
}