'use client';

import React, { useEffect, useState } from 'react';
import { History, ChevronLeft, ChevronRight, Loader2, Code2, User } from 'lucide-react';
import { useToast } from '@/components/ToastContainer';

interface AuditLogRecord {
  id: string;
  action: string;
  worker_id: string;
  details: Record<string, any>;
  created_at: string;
}

export default function AdminAuditLogsPage() {
  const { addToast } = useToast();
  const [logs, setLogs] = useState<AuditLogRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedDetail, setSelectedDetail] = useState<Record<string, any> | null>(null);

  const fetchLogs = async (targetPage: number) => {
    try {
      setIsLoading(true);
      const res = await fetch(`/api/admin/audit-logs?page=${targetPage}&limit=20`);
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || 'Failed to fetch audit logs');

      setLogs(data.logs || []);
      setPage(data.pagination.page);
      setTotalPages(data.pagination.totalPages);
    } catch (err: any) {
      console.error(err);
      addToast(err.message || 'Failed to load audit logs', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs(1);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-zinc-200/80 pb-6">
        <div>
          <h1 className="text-2xl font-extrabold tracking-widest uppercase text-zinc-900 flex items-center gap-2">
            <History className="w-6 h-6 text-zariGold" />
            Admin System Audit Logs
          </h1>
          <p className="text-zinc-500 text-sm mt-1">
            Immutable audit record of all sensitive admin actions (category reordering, staff invitations, media deletions).
          </p>
        </div>
      </div>

      <div className="bg-white border border-zinc-200/60 rounded-[16px] shadow-[0_8px_30px_rgb(0,0,0,0.02)] overflow-hidden">
        <div className="overflow-x-auto">
          {isLoading ? (
            <div className="p-12 text-center text-zinc-500 text-sm flex flex-col items-center justify-center gap-2">
              <Loader2 className="w-6 h-6 animate-spin text-zinc-900" />
              <span>Fetching audit logs from database...</span>
            </div>
          ) : logs.length === 0 ? (
            <div className="p-12 text-center text-zinc-500 text-sm">No audit log records found.</div>
          ) : (
            <table className="w-full text-left border-collapse min-w-[750px]">
              <thead>
                <tr className="border-b border-zinc-100 bg-zinc-50/70">
                  <th className="p-4 text-xs font-bold uppercase tracking-wider text-zinc-400">Action Event</th>
                  <th className="p-4 text-xs font-bold uppercase tracking-wider text-zinc-400">Actor / System</th>
                  <th className="p-4 text-xs font-bold uppercase tracking-wider text-zinc-400">Timestamp</th>
                  <th className="p-4 text-xs font-bold uppercase tracking-wider text-zinc-400 text-right">Details</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log) => (
                  <tr key={log.id} className="border-b border-zinc-100 hover:bg-zinc-50/50 transition-colors">
                    <td className="p-4">
                      <span className="inline-flex items-center px-2.5 py-1 rounded text-[11px] font-mono font-bold bg-zinc-100 text-zinc-800 border border-zinc-200">
                        {log.action}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2 text-xs font-semibold text-zinc-700">
                        <User className="w-3.5 h-3.5 text-zinc-400" />
                        <span>{log.details?.actor_id || log.worker_id || 'System'}</span>
                      </div>
                    </td>
                    <td className="p-4 text-xs font-mono text-zinc-500">
                      {new Date(log.created_at).toLocaleString()}
                    </td>
                    <td className="p-4 text-right">
                      <button
                        onClick={() => setSelectedDetail(log.details)}
                        className="px-3 py-1.5 rounded border border-zinc-200 hover:border-zinc-900 text-xs font-bold uppercase tracking-wider text-zinc-700 hover:bg-zinc-50 flex items-center gap-1.5 ml-auto"
                      >
                        <Code2 className="w-3.5 h-3.5 text-zariGold" />
                        View Payload
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="p-4 border-t border-zinc-100 flex items-center justify-between">
            <span className="text-xs text-zinc-500 font-mono">
              Page {page} of {totalPages}
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => fetchLogs(page - 1)}
                disabled={page <= 1 || isLoading}
                className="px-3 py-1.5 rounded border border-zinc-200 text-xs font-bold text-zinc-700 disabled:opacity-50 flex items-center gap-1 hover:bg-zinc-50"
              >
                <ChevronLeft className="w-4 h-4" /> Previous
              </button>
              <button
                onClick={() => fetchLogs(page + 1)}
                disabled={page >= totalPages || isLoading}
                className="px-3 py-1.5 rounded border border-zinc-200 text-xs font-bold text-zinc-700 disabled:opacity-50 flex items-center gap-1 hover:bg-zinc-50"
              >
                Next <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Payload Inspection Modal */}
      {selectedDetail && (
        <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-zinc-900 text-zinc-100 rounded-xl max-w-lg w-full p-6 shadow-2xl border border-zinc-800 animate-in fade-in">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800 mb-4">
              <h3 className="text-sm font-mono font-bold text-zariGold">Audit Event Payload</h3>
              <button onClick={() => setSelectedDetail(null)} className="text-zinc-400 hover:text-white">
                ✕
              </button>
            </div>
            <pre className="text-xs font-mono bg-black/50 p-4 rounded-lg overflow-x-auto text-green-400 border border-zinc-800">
              {JSON.stringify(selectedDetail, null, 2)}
            </pre>
            <div className="mt-4 flex justify-end">
              <button
                onClick={() => setSelectedDetail(null)}
                className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded text-xs font-bold uppercase tracking-wider"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
