'use client';

import { useEffect, useState } from 'react';
import { usersApi, type User } from '@/lib/api/users';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import { AdminUsersTable } from './ui/AdminUsersTable';
import { AdminUsersFilters } from './ui/AdminUsersFilters';
import { AdminUsersEmpty } from './ui/AdminUsersEmpty';

const ITEMS_PER_PAGE = 8;

export function AdminUsersClient() {
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [deleteUserId, setDeleteUserId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const data = await usersApi.findAll();
      setAllUsers(data || []);
      setPage(1);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to load users');
      setAllUsers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const filtered = allUsers.filter(u => {
    const q = search.toLowerCase().trim();
    return (
      !q ||
      u.email.toLowerCase().includes(q) ||
      u.firstName.toLowerCase().includes(q) ||
      u.lastName.toLowerCase().includes(q)
    );
  });

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const startIndex = (page - 1) * ITEMS_PER_PAGE;
  const users = filtered.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages && newPage !== page) setPage(newPage);
  };

  const getPageNumbers = (): (number | 'ellipsis')[] => {
    const pages: (number | 'ellipsis')[] = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else if (page <= 3) {
      for (let i = 1; i <= 4; i++) pages.push(i);
      pages.push('ellipsis');
      pages.push(totalPages);
    } else if (page >= totalPages - 2) {
      pages.push(1);
      pages.push('ellipsis');
      for (let i = totalPages - 3; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      pages.push('ellipsis');
      for (let i = page - 1; i <= page + 1; i++) pages.push(i);
      pages.push('ellipsis');
      pages.push(totalPages);
    }
    return pages;
  };

  const handleRoleUpdate = async (id: string, role: 'ADMIN' | 'PARTICIPANT') => {
    try {
      await usersApi.update(id, { role });
      toast.success('User role updated');
      fetchUsers();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to update role');
    }
  };

  const handleDeleteClick = (id: string) => setDeleteUserId(id);

  const handleDeleteConfirm = async () => {
    if (!deleteUserId) return;
    setDeleting(true);
    try {
      await usersApi.remove(deleteUserId);
      toast.success('User deleted');
      setDeleteUserId(null);
      fetchUsers();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to delete user');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Manage Users</h1>
      </div>

      <AdminUsersFilters
        search={search}
        onSearchChange={v => {
          setSearch(v);
          setPage(1);
        }}
      />

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
        </div>
      ) : !filtered.length ? (
        <AdminUsersEmpty />
      ) : (
        <>
          <AdminUsersTable
            users={users}
            onRoleUpdate={handleRoleUpdate}
            onDeleteClick={handleDeleteClick}
          />

          <AlertDialog open={!!deleteUserId} onOpenChange={open => !open && setDeleteUserId(null)}>
            <AlertDialogContent className="bg-white">
              <AlertDialogHeader>
                <AlertDialogTitle className="text-gray-900">Delete user?</AlertDialogTitle>
                <AlertDialogDescription className="text-gray-600">
                  This action cannot be undone. The user account will be permanently removed.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel
                  disabled={deleting}
                  className="bg-white border-gray-300 text-gray-900 hover:bg-gray-100"
                >
                  Cancel
                </AlertDialogCancel>
                <AlertDialogAction
                  onClick={e => {
                    e.preventDefault();
                    handleDeleteConfirm();
                  }}
                  disabled={deleting}
                  className="bg-red-600 text-white hover:bg-red-700"
                >
                  {deleting ? 'Deleting…' : 'Delete'}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

          {totalPages > 1 && (
            <div className="mt-8 flex justify-center">
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      href="#"
                      onClick={(e: React.MouseEvent) => {
                        e.preventDefault();
                        handlePageChange(page - 1);
                      }}
                      className={page === 1 ? 'pointer-events-none opacity-50' : ''}
                    />
                  </PaginationItem>
                  {getPageNumbers().map((p, idx) => (
                    <PaginationItem key={idx}>
                      {p === 'ellipsis' ? (
                        <PaginationEllipsis />
                      ) : (
                        <PaginationLink
                          href="#"
                          onClick={(e: React.MouseEvent) => {
                            e.preventDefault();
                            handlePageChange(p as number);
                          }}
                          isActive={page === p}
                          className="bg-white hover:bg-gray-100 text-gray-900"
                        >
                          {p}
                        </PaginationLink>
                      )}
                    </PaginationItem>
                  ))}
                  <PaginationItem>
                    <PaginationNext
                      href="#"
                      onClick={(e: React.MouseEvent) => {
                        e.preventDefault();
                        handlePageChange(page + 1);
                      }}
                      className={page === totalPages ? 'pointer-events-none opacity-50' : ''}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          )}
        </>
      )}
    </div>
  );
}
