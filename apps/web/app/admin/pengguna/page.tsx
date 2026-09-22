'use client';

import * as React from 'react';
import Link from 'next/link';
import { Users, Search, Shield, UserX, UserCheck, AlertTriangle } from 'lucide-react';
import { AdminUserListItem, Role, UserStatus } from '@perpusjal/types';

export default function AdminUsersPage() {
  const [users, setUsers] = React.useState<AdminUserListItem[]>([]);
  const [total, setTotal] = React.useState(0);
  const [page, setPage] = React.useState(1);
  const [totalPages, setTotalPages] = React.useState(1);
  const [loading, setLoading] = React.useState(true);
  const [searchQuery, setSearchQuery] = React.useState('');
  const [roleFilter, setRoleFilter] = React.useState<string>('');
  const [statusFilter, setStatusFilter] = React.useState<string>('');
  const [actionError, setActionError] = React.useState<string | null>(null);

  // Modal State
  const [activeModalUser, setActiveModalUser] = React.useState<AdminUserListItem | null>(null);
  const [modalType, setModalType] = React.useState<'ROLE' | 'SUSPEND' | null>(null);
  const [selectedRole, setSelectedRole] = React.useState<Role>(Role.USER);
  const [suspendReason, setSuspendReason] = React.useState('');

  const fetchUsers = React.useCallback(async () => {
    setLoading(true);
    setActionError(null);
    try {
      const params = new URLSearchParams({
        page: String(page),
        limit: '20',
      });
      if (searchQuery) params.append('q', searchQuery);
      if (roleFilter) params.append('role', roleFilter);
      if (statusFilter) params.append('status', statusFilter);

      const res = await fetch(`/api/v1/users/admin/list?${params.toString()}`, {
        credentials: 'include',
      });
      if (res.ok) {
        const json = await res.json();
        setUsers(json.data?.items || []);
        setTotal(json.data?.total || 0);
        setTotalPages(json.data?.totalPages || 1);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [page, searchQuery, roleFilter, statusFilter]);

  React.useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleUpdateRole = async () => {
    if (!activeModalUser) return;
    setActionError(null);
    try {
      const res = await fetch(`/api/v1/users/admin/${activeModalUser.id}/role`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ role: selectedRole }),
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error?.message || 'Gagal mengubah peran pengguna');
      }

      setActiveModalUser(null);
      setModalType(null);
      fetchUsers();
    } catch (err: any) {
      setActionError(err.message);
    }
  };

  const handleSuspendUser = async (suspend: boolean) => {
    if (!activeModalUser) return;
    setActionError(null);
    try {
      const res = await fetch(`/api/v1/users/admin/${activeModalUser.id}/suspend`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          suspend,
          reason: suspendReason,
        }),
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error?.message || 'Gagal mengubah status akun');
      }

      setActiveModalUser(null);
      setModalType(null);
      setSuspendReason('');
      fetchUsers();
    } catch (err: any) {
      setActionError(err.message);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground pb-20">
      {/* 1. EDITORIAL HEADER BANNER */}
      <section className="border-b border-border-hairline bg-surface-muted/40 py-10 px-4 sm:px-8">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 font-mono text-xs uppercase tracking-widest text-muted mb-2">
              <Users className="w-3.5 h-3.5" />
              <span>ADMINISTRASI KEANGGOTAAN</span>
            </div>
            <h1 className="font-serif text-3xl sm:text-4xl font-bold tracking-tight text-foreground">
              Manajemen Pengguna
            </h1>
            <p className="font-serif text-sm text-muted mt-1">
              Kelola peran pengguna (Warga, Kurator, Pengurus), status sanksi peminjaman, dan keterbukaan akses.
            </p>
          </div>

          <div className="font-mono text-xs text-muted">
            Total Terdaftar: <span className="text-foreground font-bold">{total} Warga</span>
          </div>
        </div>
      </section>

      {/* 2. FILTER & SEARCH */}
      <main className="max-w-7xl mx-auto px-4 sm:px-8 pt-8 space-y-6">
        {actionError && (
          <div className="p-4 border border-red-600 bg-red-50 text-red-900 font-mono text-xs flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>{actionError}</span>
          </div>
        )}

        <div className="flex flex-col sm:flex-row items-center gap-4 border border-border-hairline bg-surface p-4">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-muted absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Cari nama, @username, atau email..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setPage(1);
              }}
              className="w-full pl-9 pr-3 py-2 border border-border-hairline bg-background text-foreground font-mono text-xs focus:outline-none focus:border-foreground"
            />
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <select
              value={roleFilter}
              onChange={(e) => {
                setRoleFilter(e.target.value);
                setPage(1);
              }}
              className="px-3 py-2 border border-border-hairline bg-background text-foreground font-mono text-xs uppercase"
            >
              <option value="">Semua Peran</option>
              <option value="USER">Warga (User)</option>
              <option value="KURATOR">Kurator</option>
              <option value="ADMIN">Pengurus (Admin)</option>
            </select>

            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1);
              }}
              className="px-3 py-2 border border-border-hairline bg-background text-foreground font-mono text-xs uppercase"
            >
              <option value="">Semua Status</option>
              <option value="ACTIVE">Aktif</option>
              <option value="SUSPENDED">Ditangguhkan</option>
            </select>
          </div>
        </div>

        {/* 3. TABLE */}
        <div className="border border-border-hairline bg-surface overflow-x-auto">
          {loading ? (
            <div className="p-16 text-center font-mono text-xs text-muted">
              Memuat data pengguna...
            </div>
          ) : users.length === 0 ? (
            <div className="p-12 text-center font-mono text-xs text-muted">
              Tidak ada pengguna yang cocok dengan kriteria pencarian.
            </div>
          ) : (
            <table className="w-full text-left font-mono text-xs border-collapse">
              <thead>
                <tr className="border-b border-border-hairline bg-surface-muted/50 uppercase tracking-wider text-[11px] text-muted">
                  <th className="p-4 font-bold">Identitas Warga</th>
                  <th className="p-4 font-bold">Peran</th>
                  <th className="p-4 font-bold">Status</th>
                  <th className="p-4 font-bold text-center">Pinjaman Aktif</th>
                  <th className="p-4 font-bold">Bergabung</th>
                  <th className="p-4 font-bold text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-hairline">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-surface-muted/30 transition-colors">
                    <td className="p-4">
                      <div className="font-serif font-bold text-sm text-foreground">
                        <Link href={`/u/${u.username}`} className="hover:underline">
                          {u.name}
                        </Link>
                      </div>
                      <div className="text-muted text-[11px]">@{u.username} • {u.email}</div>
                    </td>

                    <td className="p-4">
                      <span className="px-2 py-0.5 border border-foreground font-bold text-[10px] uppercase">
                        {u.role}
                      </span>
                    </td>

                    <td className="p-4">
                      <span
                        className={`px-2 py-0.5 border text-[10px] uppercase font-bold ${
                          u.status === UserStatus.ACTIVE
                            ? 'border-foreground bg-foreground text-background'
                            : 'border-red-600 bg-red-50 text-red-900'
                        }`}
                      >
                        {u.status}
                      </span>
                      {u.suspensionReason && (
                        <span className="block text-[10px] text-red-800 mt-1 truncate max-w-xs">
                          Alasan: {u.suspensionReason}
                        </span>
                      )}
                    </td>

                    <td className="p-4 text-center">
                      <span className="font-serif font-bold text-sm text-foreground">
                        {u.activeLoansCount}
                      </span>
                    </td>

                    <td className="p-4 text-muted text-[11px]">
                      {new Date(u.createdAt).toLocaleDateString('id-ID', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </td>

                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => {
                            setActiveModalUser(u);
                            setSelectedRole(u.role);
                            setModalType('ROLE');
                          }}
                          className="px-2.5 py-1 border border-border-hairline hover:border-foreground text-foreground text-[11px] font-semibold"
                        >
                          Ubah Peran
                        </button>

                        {u.status === UserStatus.ACTIVE ? (
                          <button
                            onClick={() => {
                              setActiveModalUser(u);
                              setModalType('SUSPEND');
                            }}
                            className="px-2.5 py-1 border border-red-300 text-red-700 hover:border-red-600 text-[11px]"
                          >
                            Tangguhkan
                          </button>
                        ) : (
                          <button
                            onClick={() => {
                              setActiveModalUser(u);
                              handleSuspendUser(false);
                            }}
                            className="px-2.5 py-1 border border-foreground bg-foreground text-background text-[11px]"
                          >
                            Pulihkan
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* PAGINATION */}
        {totalPages > 1 && (
          <div className="flex justify-between items-center font-mono text-xs pt-4">
            <button
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="px-4 py-2 border border-border-hairline disabled:opacity-30 hover:border-foreground"
            >
              ← Sebelumnya
            </button>
            <span>Halaman {page} dari {totalPages}</span>
            <button
              disabled={page >= totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              className="px-4 py-2 border border-border-hairline disabled:opacity-30 hover:border-foreground"
            >
              Selanjutnya →
            </button>
          </div>
        )}
      </main>

      {/* MODAL UBAH PERAN */}
      {modalType === 'ROLE' && activeModalUser && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-surface border border-foreground p-6 max-w-md w-full animate-in fade-in-50 duration-150">
            <div className="flex items-center gap-2 border-b border-border-hairline pb-3 mb-4">
              <Shield className="w-4 h-4 text-foreground" />
              <h3 className="font-serif text-lg font-bold text-foreground">
                Ubah Peran Akses Pengguna
              </h3>
            </div>

            <p className="font-serif text-sm text-foreground/80 mb-4">
              Ubah hak akses wewenang untuk <strong>{activeModalUser.name}</strong> (@{activeModalUser.username}):
            </p>

            <div className="space-y-3 font-mono text-xs mb-6">
              {[
                { r: Role.USER, label: 'WARGA (USER)', desc: 'Hak pinjam buku, kirim artikel/surat, dan komentar.' },
                { r: Role.KURATOR, label: 'KURATOR', desc: 'Hak meninjau tulisan warga di meja kurasi dan moderasi komentar.' },
                { r: Role.ADMIN, label: 'PENGURUS (ADMIN)', desc: 'Hak kendali penuh atas sistem, sirkulasi lapak, dan keanggotaan.' },
              ].map((item) => (
                <label
                  key={item.r}
                  className={`block p-3 border cursor-pointer transition-colors ${
                    selectedRole === item.r
                      ? 'border-foreground bg-surface-muted'
                      : 'border-border-hairline hover:border-foreground/50'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="userRole"
                      checked={selectedRole === item.r}
                      onChange={() => setSelectedRole(item.r)}
                      className="accent-foreground"
                    />
                    <span className="font-bold">{item.label}</span>
                  </div>
                  <span className="font-sans text-xs text-muted block mt-1 ml-5">
                    {item.desc}
                  </span>
                </label>
              ))}
            </div>

            <div className="flex justify-end gap-3 font-mono text-xs">
              <button
                onClick={() => {
                  setModalType(null);
                  setActiveModalUser(null);
                }}
                className="px-4 py-2 border border-border-hairline hover:border-foreground"
              >
                Batal
              </button>
              <button
                onClick={handleUpdateRole}
                className="px-5 py-2 border border-foreground bg-foreground text-background font-bold hover:opacity-90"
              >
                Simpan Perubahan
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL PENANGGUHAN AKUN */}
      {modalType === 'SUSPEND' && activeModalUser && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-surface border border-red-600 p-6 max-w-md w-full animate-in fade-in-50 duration-150">
            <div className="flex items-center gap-2 border-b border-red-200 pb-3 mb-4 text-red-900">
              <UserX className="w-5 h-5 text-red-600" />
              <h3 className="font-serif text-lg font-bold">
                Penangguhan Akses Akun
              </h3>
            </div>

            <p className="font-serif text-sm text-foreground/85 mb-3 leading-relaxed">
              Kamu akan membekukan akses akun <strong>{activeModalUser.name}</strong> (@{activeModalUser.username}). Pengguna tidak dapat meminjam buku atau mengirim tulisan selama status ditangguhkan.
            </p>

            <div className="mb-6">
              <label className="block font-mono text-xs uppercase tracking-wider text-muted mb-1.5">
                Alasan Penangguhan (Wajib Diisi):
              </label>
              <textarea
                required
                rows={3}
                placeholder="Misal: Keterlambatan buku berulang tanpa konfirmasi / pelanggaran etika diskusi..."
                value={suspendReason}
                onChange={(e) => setSuspendReason(e.target.value)}
                className="w-full px-3 py-2 border border-border-hairline bg-background text-foreground font-serif text-xs focus:outline-none focus:border-red-600"
              />
            </div>

            <div className="flex justify-end gap-3 font-mono text-xs">
              <button
                onClick={() => {
                  setModalType(null);
                  setActiveModalUser(null);
                  setSuspendReason('');
                }}
                className="px-4 py-2 border border-border-hairline hover:border-foreground"
              >
                Batal
              </button>
              <button
                disabled={!suspendReason.trim()}
                onClick={() => handleSuspendUser(true)}
                className="px-5 py-2 border border-red-600 bg-red-600 text-white font-bold hover:opacity-90 disabled:opacity-50"
              >
                Tangguhkan Akun
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
