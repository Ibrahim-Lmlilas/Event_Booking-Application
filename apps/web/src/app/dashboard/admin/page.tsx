'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/hooks/useAuth';
import { Loader2, Calendar, BookmarkCheck, Users, TicketCheck } from 'lucide-react';
import type { IEvent, IReservationWithDetails } from '@/types';
import { eventsApi } from '@/lib/api/events';
import { reservationsApi } from '@/lib/api/reservations';
import { usersApi } from '@/lib/api/users';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  Filler,
  PointElement,
  LineElement,
  registerables,
} from 'chart.js';
import { Bar, Doughnut, Line } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  Filler,
  PointElement,
  LineElement,
  ...registerables,
);

// Gradient pink → purple (couleurs dyal site)
const PINK = 'rgb(236, 72, 153)';
const PURPLE = 'rgb(147, 51, 234)';
const COLORS = {
  primary: 'rgb(17, 24, 39)',
  pink: PINK,
  purple: PURPLE,
  pinkLight: 'rgba(236, 72, 153, 0.5)',
  purpleLight: 'rgba(147, 51, 234, 0.5)',
  gray: 'rgb(75, 85, 99)',
  white: 'rgb(255, 255, 255)',
  green: 'rgb(34, 197, 94)',
  yellow: 'rgb(234, 179, 8)',
  red: 'rgb(239, 68, 68)',
};

function createPinkPurpleGradient(
  chart: {
    ctx: CanvasRenderingContext2D;
    chartArea?: { top: number; bottom: number; left: number; right: number };
  },
  vertical = true,
) {
  const ctx = chart.ctx;
  const area = chart.chartArea;
  if (!area) return PINK;
  const gradient = ctx.createLinearGradient(
    vertical ? 0 : area.left,
    vertical ? area.top : 0,
    vertical ? 0 : area.right,
    vertical ? area.bottom : 0,
  );
  gradient.addColorStop(0, 'rgba(236, 72, 153, 0.7)');
  gradient.addColorStop(0.5, 'rgba(180, 62, 193, 0.6)');
  gradient.addColorStop(1, 'rgba(147, 51, 234, 0.7)');
  return gradient;
}

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      labels: { color: COLORS.primary, font: { size: 12 } },
    },
  },
  scales: {
    ...({} as Record<string, unknown>),
  },
};

export default function AdminDashboard() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [eventsCount, setEventsCount] = useState<number>(0);
  const [reservationsCount, setReservationsCount] = useState<number>(0);
  const [reservationsByStatus, setReservationsByStatus] = useState<Record<string, number>>({});
  const [eventsPerMonth, setEventsPerMonth] = useState<number[]>([]);
  const [reservationsPerDay, setReservationsPerDay] = useState<number[]>([]);
  const [usersCount, setUsersCount] = useState<number>(0);
  const monthLabels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];

  useEffect(() => {
    if (!user) return;
    eventsApi
      .list(1, 500)
      .then(res => {
        const events = res.events ?? [];
        setEventsCount(events.length);
        const now = new Date();
        const counts = [0, 0, 0, 0, 0, 0];
        events.forEach((ev: IEvent) => {
          const d = ev.date ? new Date(ev.date) : ev.createdAt ? new Date(ev.createdAt) : now;
          const monthsAgo =
            (now.getFullYear() - d.getFullYear()) * 12 + (now.getMonth() - d.getMonth());
          if (monthsAgo >= 0 && monthsAgo < 6) counts[5 - monthsAgo]++;
        });
        setEventsPerMonth(counts);
      })
      .catch(() => setEventsCount(0));
  }, [user]);

  useEffect(() => {
    if (!user) return;
    reservationsApi
      .findAll({})
      .then(list => {
        const arr = list ?? [];
        setReservationsCount(arr.length);
        const byStatus: Record<string, number> = {
          PENDING: 0,
          CONFIRMED: 0,
          REFUSED: 0,
          CANCELED: 0,
        };
        const dayCounts = [0, 0, 0, 0, 0, 0, 0];
        arr.forEach((r: IReservationWithDetails) => {
          const s = r.status || 'PENDING';
          byStatus[s] = (byStatus[s] ?? 0) + 1;
          if (r.createdAt) {
            const day = new Date(r.createdAt).getDay();
            dayCounts[day] = (dayCounts[day] ?? 0) + 1;
          }
        });
        setReservationsByStatus(byStatus);
        setReservationsPerDay(dayCounts);
      })
      .catch(() => setReservationsCount(0));
  }, [user]);

  useEffect(() => {
    if (!user) return;
    usersApi
      .findAll()
      .then(list => setUsersCount(list?.length ?? 0))
      .catch(() => setUsersCount(0));
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
      if (role !== 'admin') {
        if (role === 'participant') router.push('/dashboard/participant');
        else router.push('/');
      }
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
  if (role !== 'admin') return null;

  const barData = {
    labels: monthLabels,
    datasets: [
      {
        label: 'Events',
        data: eventsPerMonth.length === 6 ? eventsPerMonth : [0, 0, 0, 0, 0, 0],
        backgroundColor: (context: {
          chart: {
            ctx: CanvasRenderingContext2D;
            chartArea?: { top: number; bottom: number; left: number; right: number };
          };
        }) => {
          if (!context.chart.chartArea) return COLORS.pinkLight;
          return createPinkPurpleGradient(context.chart);
        },
        borderColor: PINK,
        borderWidth: 1,
      },
    ],
  };

  const doughnutData = {
    labels: ['PENDING', 'CONFIRMED', 'REFUSED', 'CANCELED'],
    datasets: [
      {
        data: [
          reservationsByStatus.PENDING ?? 0,
          reservationsByStatus.CONFIRMED ?? 0,
          reservationsByStatus.REFUSED ?? 0,
          reservationsByStatus.CANCELED ?? 0,
        ],
        backgroundColor: [
          'rgba(236, 72, 153, 0.9)',
          'rgba(147, 51, 234, 0.9)',
          'rgba(180, 62, 193, 0.9)',
          'rgba(126, 34, 206, 0.9)',
        ],
        borderColor: COLORS.white,
        borderWidth: 2,
      },
    ],
  };

  const lineData = {
    labels: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
    datasets: [
      {
        label: 'Reservations',
        data: reservationsPerDay.length === 7 ? reservationsPerDay : [0, 0, 0, 0, 0, 0, 0],
        borderColor: PURPLE,
        backgroundColor: (context: { chart: unknown }) => {
          const ch = context.chart as {
            ctx: CanvasRenderingContext2D;
            chartArea?: { top: number; bottom: number; left: number; right: number };
          };
          if (!ch.chartArea) return COLORS.purpleLight;
          return createPinkPurpleGradient(ch);
        },
        fill: true,
        tension: 0.3,
      },
    ],
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900"> {user.lastName}</h1>
        <p className="text-sm text-gray-600 mt-1">{user.email}</p>
      </div>

      {/* 2x2 grid: chaque wa7da 50% width */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 50% lawla: 4 stat cards */}
        <div className="grid grid-cols-2 gap-4">
          <Link
            href="/dashboard/admin/events"
            className="bg-white rounded-lg shadow p-4 block hover:shadow-md transition-shadow border border-gray-100"
          >
            <Calendar className="h-8 w-8 text-gray-900 mb-2" />
            <h3 className="text-sm font-semibold text-gray-900">Total Events</h3>
            <p className="text-2xl font-bold text-gray-900 mt-1">{eventsCount}</p>
          </Link>
          <div className="bg-white rounded-lg shadow p-4 border border-gray-100">
            <BookmarkCheck className="h-8 w-8 text-gray-900 mb-2" />
            <h3 className="text-sm font-semibold text-gray-900">Reservations</h3>
            <p className="text-2xl font-bold text-gray-900 mt-1">{reservationsCount}</p>
          </div>
          <Link
            href="/dashboard/admin/users"
            className="bg-white rounded-lg shadow p-4 border border-gray-100 block hover:shadow-md transition-shadow"
          >
            <Users className="h-8 w-8 text-gray-900 mb-2" />
            <h3 className="text-sm font-semibold text-gray-900">Users</h3>
            <p className="text-2xl font-bold text-gray-900 mt-1">{usersCount}</p>
          </Link>
          <div className="bg-white rounded-lg shadow p-4 border border-gray-100">
            <TicketCheck className="h-8 w-8 text-gray-600 mb-2" />
            <h3 className="text-sm font-semibold text-gray-900">Confirmed</h3>
            <p className="text-2xl font-bold text-gray-900 mt-1">
              {reservationsByStatus.CONFIRMED ?? 0}
            </p>
          </div>
        </div>

        {/* 50% lkhrin: Chart 1 - Bar */}
        <div className="bg-white rounded-lg shadow p-4 border border-gray-100 h-[280px]">
          <h3 className="text-sm font-semibold text-gray-900 mb-3">Events (last 6 months)</h3>
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

        {/* Chart 2 - Doughnut */}
        <div className="bg-white rounded-lg shadow p-4 border border-gray-100 h-[280px]">
          <h3 className="text-sm font-semibold text-gray-900 mb-3">Reservations by status</h3>
          <div className="h-[220px] flex items-center justify-center">
            <Doughnut
              data={doughnutData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                cutout: '60%',
                plugins: { legend: { labels: { color: COLORS.primary, font: { size: 12 } } } },
              }}
            />
          </div>
        </div>

        {/* Chart 3 - Line */}
        <div className="bg-white rounded-lg shadow p-4 border border-gray-100 h-[280px]">
          <h3 className="text-sm font-semibold text-gray-900 mb-3">Reservations trend</h3>
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
