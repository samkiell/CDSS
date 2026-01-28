'use client';

import { 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer, 
  Tooltip, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid 
} from 'recharts';

export function UsersActivityChart({ active, pending }) {
  const data = [
    { name: 'Active Users', value: active, color: '#3b82f6' },
    { name: 'Pending Users', value: pending, color: '#e2e8f0' },
  ];

  return (
    <div className="rounded-3xl border border-gray-100 bg-white p-8 shadow-sm dark:border-gray-800 dark:bg-gray-900">
      <h4 className="mb-6 text-sm font-bold uppercase tracking-widest text-gray-400">Users Activity</h4>
      <div className="flex items-center gap-8">
        <div className="h-[180px] w-[180px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="space-y-4">
          <div>
            <p className="text-3xl font-black text-gray-900 dark:text-white">{active + pending}</p>
            <p className="text-sm font-medium text-gray-400">Total Patients</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="h-3 w-3 rounded-full bg-blue-500"></span>
              <span className="text-sm font-bold text-gray-700 dark:text-gray-300">Active</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="h-3 w-3 rounded-full bg-gray-200 dark:bg-gray-700"></span>
              <span className="text-sm font-bold text-gray-700 dark:text-gray-300">Pending</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function TherapistActivityChart({ active, total }) {
  const data = [
    { name: 'Online', value: active, color: '#10b981' },
    { name: 'Offline', value: total - active, color: '#f3f4f6' },
  ];

  return (
    <div className="rounded-3xl border border-gray-100 bg-white p-8 shadow-sm dark:border-gray-800 dark:bg-gray-900">
      <h4 className="mb-6 text-sm font-bold uppercase tracking-widest text-gray-400">Therapist Activity</h4>
      <div className="flex items-center gap-8">
        <div className="h-[180px] w-[180px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="space-y-4">
          <div>
            <p className="text-3xl font-black text-gray-900 dark:text-white">{total}</p>
            <p className="text-sm font-medium text-gray-400">Total Clinicians</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-full bg-green-500"></span>
            <span className="text-sm font-bold text-gray-700 dark:text-gray-300">Active / Verified</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export function WeeklyReportChart({ data }) {
  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data}>
          <defs>
            <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
            </linearGradient>
            <linearGradient id="colorTherapists" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
          <XAxis 
            dataKey="day" 
            axisLine={false} 
            tickLine={false} 
            tick={{ fill: '#9ca3af', fontSize: 12, fontWeight: 600 }}
            dy={10}
          />
          <YAxis 
            axisLine={false} 
            tickLine={false} 
            tick={{ fill: '#9ca3af', fontSize: 12, fontWeight: 600 }}
          />
          <Tooltip 
            contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)' }}
          />
          <Area 
            type="monotone" 
            dataKey="users" 
            stroke="#3b82f6" 
            strokeWidth={4}
            fillOpacity={1} 
            fill="url(#colorUsers)" 
          />
          <Area 
            type="monotone" 
            dataKey="therapists" 
            stroke="#10b981" 
            strokeWidth={4}
            fillOpacity={1} 
            fill="url(#colorTherapists)" 
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
