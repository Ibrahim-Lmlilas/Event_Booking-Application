'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/hooks/useAuth';
import { Loader2 } from 'lucide-react';
import { reservationsApi } from '@/lib/api/reservations';
import type { IReservationWithDetails } from '@/types';
import { eventsApi } from '@/lib/api/events';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  PointElement,
  LineElement,
  registerables,
} from 'chart.js';
import { Bar, Line } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  PointElement,
  LineElement,
  ...registerables,
);

// Participant: zra9 (green) + purple (b7al admin b pink)
const GREEN = 'rgb(34, 197, 94)';
const PURPLE = 'rgb(147, 51, 234)';
const COLORS = {
  primary: 'rgb(17, 24, 39)',
  green: GREEN,
  purple: PURPLE,
  gray: 'rgb(75, 85, 99)',
  white: 'rgb(255, 255, 255)',
  yellow: 'rgb(234, 179, 8)',
  red: 'rgb(239, 68, 68)',
};

function createGreenPurpleGradient(
  chart: {
    ctx: CanvasRenderingContext2D;
    chartArea?: { top: number; bottom: number; left: number; right: number };
  },
  vertical = true,
) {
  const ctx = chart.ctx;
  const area = chart.chartArea;
  if (!area) return 'rgba(34, 197, 94, 0.5)';
  const gradient = ctx.createLinearGradient(
    vertical ? 0 : area.left,
    vertical ? area.top : 0,
    vertical ? 0 : area.right,
    vertical ? area.bottom : 0,
  );
  gradient.addColorStop(0, 'rgba(34, 197, 94, 0.7)');
  gradient.addColorStop(0.5, 'rgba(74, 122, 164, 0.6)');
  gradient.addColorStop(1, 'rgba(147, 51, 234, 0.7)');
  return gradient;
}

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { labels: { color: COLORS.primary, font: { size: 12 } } },
  },
  scales: {} as Record<string, unknown>,
};

export default function ParticipantDashboard() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [, setReservationsCount] = useState(0);
  const [byStatus, setByStatus] = useState<Record<string, number>>({});
  const [, setUpcomingCount] = useState(0);
  const [totalEvents, setTotalEvents] = useState(0);
  const [perMonth, setPerMonth] = useState<number[]>([]);
  const [perDay, setPerDay] = useState<number[]>([]);
  const [reservations, setReservations] = useState<IReservationWithDetails[]>([]);

  useEffect(() => {
    if (!user) return;
    reservationsApi
      .findAll()
      .then(list => {
        const arr = (list ?? []) as IReservationWithDetails[];
        setReservations(arr);
        setReservationsCount(arr.length);
        const status: Record<string, number> = {
          PENDING: 0,
          CONFIRMED: 0,
          REFUSED: 0,
          CANCELED: 0,
        };
        const dayCounts = [0, 0, 0, 0, 0, 0, 0];
        const monthCounts = [0, 0, 0, 0, 0, 0];
        const now = new Date();
        let upcoming = 0;

        arr.forEach((r: { status?: string; createdAt?: string; eventId?: { date?: string } }) => {
          const s = (r.status || 'PENDING') as keyof typeof status;
          status[s] = (status[s] ?? 0) + 1;
          if (r.createdAt) {
            const d = new Date(r.createdAt);
            dayCounts[d.getDay()] = (dayCounts[d.getDay()] ?? 0) + 1;
            const monthsAgo =
              (now.getFullYear() - d.getFullYear()) * 12 + (now.getMonth() - d.getMonth());
            if (monthsAgo >= 0 && monthsAgo < 6) monthCounts[5 - monthsAgo]++;
          }
          const ev = r.eventId as { date?: string } | undefined;
          if (
            ev?.date &&
            new Date(ev.date) >= now &&
            (r.status === 'CONFIRMED' || r.status === 'PENDING')
          )
            upcoming++;
        });

        setByStatus(status);
        setPerMonth(monthCounts);
        setPerDay(dayCounts);
        setUpcomingCount(upcoming);
      })
      .catch(() => setReservationsCount(0));

    eventsApi
      .listPublished(1, 1)
      .then(res => setTotalEvents(res.total ?? 0))
      .catch(() => setTotalEvents(0));
  }, [user]);

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push('/');
        return;
      }
      const role = String(user.role || '')
        .toLowerCase()
        .trim();
      if (role === 'admin') router.push('/dashboard/admin');
      else if (role !== 'participant') router.push('/');
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-gray-900" />
      </div>
    );
  }

  if (!user) return null;
  const role = String(user.role || '')
    .toLowerCase()
    .trim();
  if (role === 'admin') return null;

  const barData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [
      {
        label: 'Your bookings',
        data: perMonth.length === 6 ? perMonth : [0, 0, 0, 0, 0, 0],
        backgroundColor: (context: {
          chart: {
            ctx: CanvasRenderingContext2D;
            chartArea?: { top: number; bottom: number; left: number; right: number };
          };
        }) => {
          if (!context.chart.chartArea) return 'rgba(34, 197, 94, 0.5)';
          return createGreenPurpleGradient(context.chart);
        },
        borderColor: GREEN,
        borderWidth: 1,
      },
    ],
  };

  const totalEventsLineData = {
    labels: ['', ''],
    datasets: [
      {
        label: 'Total events',
        data: [0, totalEvents],
        borderColor: GREEN,
        backgroundColor: 'rgba(34, 197, 94, 0.2)',
        fill: true,
        tension: 0.3,
        pointBackgroundColor: GREEN,
        pointBorderColor: GREEN,
      },
    ],
  };

  const confirmedLineData = {
    labels: ['', ''],
    datasets: [
      {
        label: 'Confirmed',
        data: [0, byStatus.CONFIRMED ?? 0],
        borderColor: PURPLE,
        backgroundColor: 'rgba(147, 51, 234, 0.2)',
        fill: true,
        tension: 0.3,
        pointBackgroundColor: PURPLE,
        pointBorderColor: PURPLE,
      },
    ],
  };

  const lineData = {
    labels: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
    datasets: [
      {
        label: 'Your bookings',
        data: perDay.length === 7 ? perDay : [0, 0, 0, 0, 0, 0, 0],
        borderColor: PURPLE,
        backgroundColor: (context: { chart: unknown }) => {
          const ch = context.chart as {
            ctx: CanvasRenderingContext2D;
            chartArea?: { top: number; bottom: number; left: number; right: number };
          };
          if (!ch.chartArea) return 'rgba(147, 51, 234, 0.4)';
          return createGreenPurpleGradient(ch);
        },
        fill: true,
        tension: 0.3,
      },
    ],
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Your dashboard</h1>
        <p className="text-sm text-gray-600 mt-1">
          Welcome back, {user.firstName} {user.lastName}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white rounded-lg shadow p-4 border border-gray-100">
            <div className="h-[230px] mt-2">
              <Line
                data={confirmedLineData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: { legend: { display: false } },
                  scales: {
                    x: { ticks: { display: false } },
                    y: { ticks: { color: COLORS.gray }, beginAtZero: true },
                  },
                }}
              />
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-4 border border-gray-100">
            <div className="h-[230px] mt-2">
              <Line
                data={totalEventsLineData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: { legend: { display: false } },
                  scales: {
                    x: { ticks: { display: false } },
                    y: { ticks: { color: COLORS.gray }, beginAtZero: true },
                  },
                }}
              />
            </div>
          </div>
        </div>

        {/* Chart 1 - Bar */}
        <div className="bg-white rounded-lg shadow p-4 border border-gray-100 h-[280px]">
          <h3 className="text-sm font-semibold text-gray-900 mb-3">
            Your bookings (last 6 months)
          </h3>
          <div className="h-[220px]">
            <Bar
              data={barData}
              options={{
                ...chartOptions,
                scales: {
                  x: { ticks: { color: COLORS.gray } },
                  y: { ticks: { color: COLORS.gray }, beginAtZero: true },
                },
              }}
            />
          </div>
        </div>

        {/* Tablo: 3 colonnes b7al My Reservations — Event, Date, Status */}
        <div className="bg-white rounded-lg shadow p-4 border border-gray-100">
          <h3 className="text-sm font-semibold text-gray-900 mb-3">My Reservations</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left text-gray-700">
              <thead>
                <tr className="border-b border-gray-200 text-gray-900 font-semibold">
                  <th className="py-2 pr-3">Event</th>
                  <th className="py-2 pr-3">Date</th>
                  <th className="py-2">Status</th>
                </tr>
              </thead>
              <tbody>
                {reservations
                  .filter(r => r.eventId && typeof r.eventId === 'object' && 'title' in r.eventId)
                  .map(r => {
                    const ev = r.eventId as { title?: string; date?: string; time?: string };
                    const dateStr = ev?.date ? new Date(ev.date).toLocaleDateString() : '—';
                    const timeStr = ev?.time ?? '';
                    return (
                      <tr key={r._id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td
                          className="py-2 pr-3 font-medium text-gray-900 truncate max-w-[140px]"
                          title={ev?.title}
                        >
                          {ev?.title ?? '—'}
                        </td>
                        <td className="py-2 pr-3">
                          {dateStr}
                          {timeStr ? ` · ${timeStr}` : ''}
                        </td>
                        <td className="py-2">
                          <span
                            className={`inline-block px-2 py-0.5 rounded text-xs font-semibold ${
                              r.status === 'CONFIRMED'
                                ? 'bg-green-100 text-green-800'
                                : r.status === 'PENDING'
                                  ? 'bg-amber-100 text-amber-800'
                                  : r.status === 'REFUSED'
                                    ? 'bg-red-100 text-red-800'
                                    : 'bg-gray-100 text-gray-700'
                            }`}
                          >
                            {r.status}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
            {reservations.filter(
              r => r.eventId && typeof r.eventId === 'object' && 'title' in r.eventId,
            ).length === 0 && (
              <p className="text-gray-500 py-4 text-center text-sm">No reservations yet</p>
            )}
          </div>
        </div>

        {/* Chart 3 - Line */}
        <div className="bg-white rounded-lg shadow p-4 border border-gray-100 h-[280px]">
          <h3 className="text-sm font-semibold text-gray-900 mb-3">
            When you booked (by day of week)
          </h3>
          <div className="h-[220px]">
            <Line
              data={lineData}
              options={{
                ...chartOptions,
                scales: {
                  x: { ticks: { color: COLORS.gray } },
                  y: { ticks: { color: COLORS.gray }, beginAtZero: true },
                },
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
