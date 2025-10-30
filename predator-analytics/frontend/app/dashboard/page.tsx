'use client';

import { useEffect, useState } from 'react';
import { analyticsApi } from '@/lib/api';
import { Activity, TrendingUp, CheckCircle, XCircle } from 'lucide-react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

export default function DashboardPage() {
  const [overview, setOverview] = useState<any>(null);
  const [agentStats, setAgentStats] = useState<any[]>([]);
  const [timeline, setTimeline] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [overviewRes, agentsRes, timelineRes] = await Promise.all([
        analyticsApi.overview(),
        analyticsApi.agents(),
        analyticsApi.timeline(7),
      ]);

      setOverview(overviewRes.data);
      setAgentStats(agentsRes.data);
      setTimeline(timelineRes.data);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-white">Завантаження...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-white mb-8">Дашборд аналітики</h1>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white/5 backdrop-blur-md rounded-xl p-6 border border-white/10">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-400">Всього завдань</span>
              <Activity className="w-5 h-5 text-purple-400" />
            </div>
            <div className="text-3xl font-bold text-white">{overview?.total_tasks || 0}</div>
          </div>

          <div className="bg-white/5 backdrop-blur-md rounded-xl p-6 border border-white/10">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-400">Завершено</span>
              <CheckCircle className="w-5 h-5 text-green-400" />
            </div>
            <div className="text-3xl font-bold text-white">
              {overview?.tasks_by_status?.completed || 0}
            </div>
          </div>

          <div className="bg-white/5 backdrop-blur-md rounded-xl p-6 border border-white/10">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-400">Помилки</span>
              <XCircle className="w-5 h-5 text-red-400" />
            </div>
            <div className="text-3xl font-bold text-white">
              {overview?.tasks_by_status?.failed || 0}
            </div>
          </div>

          <div className="bg-white/5 backdrop-blur-md rounded-xl p-6 border border-white/10">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-400">Сер. час (сек)</span>
              <TrendingUp className="w-5 h-5 text-blue-400" />
            </div>
            <div className="text-3xl font-bold text-white">
              {overview?.avg_execution_time_seconds?.toFixed(2) || 0}
            </div>
          </div>
        </div>

        {/* Timeline Chart */}
        <div className="bg-white/5 backdrop-blur-md rounded-xl p-6 border border-white/10 mb-8">
          <h2 className="text-xl font-semibold text-white mb-4">Активність за 7 днів</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={timeline}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis dataKey="date" stroke="#9ca3af" />
              <YAxis stroke="#9ca3af" />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgba(30, 27, 75, 0.9)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '8px',
                }}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="total_tasks"
                stroke="#a855f7"
                strokeWidth={2}
                name="Всього завдань"
              />
              <Line
                type="monotone"
                dataKey="completed_tasks"
                stroke="#22c55e"
                strokeWidth={2}
                name="Завершено"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Agents Stats */}
        <div className="bg-white/5 backdrop-blur-md rounded-xl p-6 border border-white/10">
          <h2 className="text-xl font-semibold text-white mb-4">Статистика агентів</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={agentStats}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis dataKey="agent_name" stroke="#9ca3af" />
              <YAxis stroke="#9ca3af" />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgba(30, 27, 75, 0.9)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '8px',
                }}
              />
              <Legend />
              <Bar dataKey="completed_tasks" fill="#22c55e" name="Завершено" />
              <Bar dataKey="failed_tasks" fill="#ef4444" name="Помилки" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
