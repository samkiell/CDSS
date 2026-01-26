'use client';

import React from 'react';
import ActivityDonutChart from '@/components/dashboard/ActivityDonutChart';
import WeeklyAreaChart from '@/components/dashboard/WeeklyAreaChart';
import PersonCard from '@/components/dashboard/PersonCard';
import { DashboardCard } from '@/components/dashboard/DashboardCard';

export default function ClinicianDashboardPage() {
  return (
    <div className="animate-fade-in mx-auto max-w-[1600px] space-y-8 pb-12">
      {/* Row 1: Users Activity & New Cases */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
        <div className="lg:col-span-4">
          <ActivityDonutChart title="Users Activity" type="Users" />
        </div>
        <div className="lg:col-span-8">
          <DashboardCard title="New Cases">
            <div className="grid h-full grid-cols-1 gap-6 md:grid-cols-2">
              <PersonCard
                name="Bola Ahmed Tinubu"
                sex="Male"
                meta="Case #1293"
                isUrgent={true}
              />
              <PersonCard
                name="Tomisi Faith John"
                sex="Female"
                meta="Case #1294"
                isUrgent={true}
              />
            </div>
          </DashboardCard>
        </div>
      </div>

      {/* Row 2: Therapist Activity & Weekly Report */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
        <div className="lg:col-span-4">
          <ActivityDonutChart title="Therapist Activity" type="Therapists" />
        </div>
        <div className="lg:col-span-8">
          <WeeklyAreaChart />
        </div>
      </div>

      {/* Section: New Approved Therapists */}
      <div className="space-y-4">
        <h3 className="px-2 text-xl font-black tracking-tight text-gray-900">
          New Approved Therapists
        </h3>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          <PersonCard
            name="Henry Ahmed Garet"
            sex="Male"
            meta="Counseling"
            statusColor="green"
          />
          <PersonCard
            name="Bola Saed Dushak"
            sex="Male"
            meta="Physiotherapy"
            statusColor="green"
          />
          <PersonCard
            name="Esther Kolawole"
            sex="Female"
            meta="Psychology"
            statusColor="green"
          />
        </div>
      </div>

      {/* Section: Pending Therapists */}
      <div className="space-y-4">
        <h3 className="px-2 text-xl font-black tracking-tight text-gray-900">
          Pending Therapists
        </h3>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          <PersonCard
            name="Samuel Abiola"
            sex="Male"
            meta="Pending Approval"
            statusColor="yellow"
          />
          <PersonCard
            name="Grace Omotola"
            sex="Female"
            meta="Verifying Credentials"
            statusColor="yellow"
          />
          <PersonCard
            name="David Adeleke"
            sex="Male"
            meta="Awaiting Review"
            statusColor="yellow"
          />
        </div>
      </div>
    </div>
  );
}
