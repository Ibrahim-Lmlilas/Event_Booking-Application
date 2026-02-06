'use client';

import { User, Shield, UserCircle, Trash2 } from 'lucide-react';
import type { User as UserType } from '@/lib/api/users';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

type Props = {
  users: UserType[];
  onRoleUpdate: (id: string, role: 'ADMIN' | 'PARTICIPANT') => void;
  onDeleteClick: (id: string) => void;
};

function normalizeRole(role: string): 'ADMIN' | 'PARTICIPANT' {
  const r = String(role || '').toUpperCase();
  return r === 'ADMIN' ? 'ADMIN' : 'PARTICIPANT';
}

export function AdminUsersTable({ users, onRoleUpdate, onDeleteClick }: Props) {
  return (
    <div className="bg-white rounded-lg shadow overflow-hidden border border-gray-100">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                User
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Email
              </th>
              <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Role
              </th>
              <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Created
              </th>
              <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {users.map(u => (
              <tr key={u._id} className="hover:bg-gray-50">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <span className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                      <User className="h-4 w-4 text-gray-600" />
                    </span>
                    <span className="font-medium text-gray-900">
                      {u.firstName} {u.lastName}
                    </span>
                  </div>
                </td>
                <td className="px-4 py-3 text-sm text-gray-600">{u.email}</td>
                <td className="px-4 py-3 text-center">
                  <Select
                    value={normalizeRole(u.role)}
                    onValueChange={(v: 'ADMIN' | 'PARTICIPANT') => onRoleUpdate(u._id, v)}
                  >
                    <SelectTrigger className="w-[130px] mx-auto bg-white">
                      <SelectValue placeholder="Role" />
                    </SelectTrigger>
                    <SelectContent className="bg-white">
                      <SelectItem value="ADMIN" className="hover:cursor-pointer">
                        <span className="flex items-center gap-2">
                          <Shield className="h-4 w-4" />
                          Admin
                        </span>
                      </SelectItem>
                      <SelectItem value="PARTICIPANT" className="hover:cursor-pointer">
                        <span className="flex items-center gap-2">
                          <UserCircle className="h-4 w-4" />
                          Participant
                        </span>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </td>
                <td className="px-4 py-3 text-center text-sm text-gray-500">
                  {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : '–'}
                </td>
                <td className="px-4 py-3 text-center">
                  <button
                    onClick={() => onDeleteClick(u._id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Delete user"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
