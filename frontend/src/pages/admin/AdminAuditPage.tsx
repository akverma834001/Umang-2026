import React, { useEffect, useState } from 'react';
import { api } from '../../services/api';
import { AuditLogItem } from '../../types';
import { History, Search, Filter, ShieldCheck, Eye, X } from 'lucide-react';
import { formatISTDateTime } from '../../utils/date';

export const AdminAuditPage: React.FC = () => {
  const [logs, setLogs] = useState<AuditLogItem[]>([]);
  const [selectedLog, setSelectedLog] = useState<AuditLogItem | null>(null);
  const [filterAction, setFilterAction] = useState('');
  const [filterEntity, setFilterEntity] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchLogs = () => {
    setLoading(true);
    api.getAdminAuditLogs({
      action: filterAction || undefined,
      entity_type: filterEntity || undefined
    })
      .then(setLogs)
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchLogs();
  }, [filterEntity]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchLogs();
  };

  return (
    <div className="space-y-6">
      <div className="border-b border-stone-200 dark:border-stone-800 pb-4">
        <h1 className="text-2xl font-bold font-serif text-stone-900 dark:text-white">Administrative Security Audit Trail</h1>
        <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
          Immutable ledger of all administrator mutations, score corrections, publishing operations, and logins.
        </p>
      </div>

      {/* Filter bar */}
      <form onSubmit={handleSearchSubmit} className="flex flex-wrap items-center gap-3 bg-white dark:bg-stone-900 p-4 rounded-xl border border-stone-200 dark:border-stone-800 shadow-xs text-xs">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
          <input
            type="text"
            placeholder="Filter by action (e.g. RESULT_CORRECTED, EVENT_CREATED)..."
            value={filterAction}
            onChange={(e) => setFilterAction(e.target.value)}
            className="w-full pl-8 pr-3 py-2 bg-stone-50 dark:bg-stone-950 border border-stone-300 dark:border-stone-700 rounded-lg text-stone-900 dark:text-white"
          />
        </div>

        <select
          value={filterEntity}
          onChange={(e) => setFilterEntity(e.target.value)}
          className="p-2 bg-stone-50 dark:bg-stone-950 border border-stone-300 dark:border-stone-700 rounded-lg text-stone-900 dark:text-white"
        >
          <option value="">All Entities</option>
          <option value="EVENT">EVENT</option>
          <option value="RESULT">RESULT</option>
          <option value="FORM">FORM</option>
          <option value="TEAM">TEAM</option>
          <option value="VENUE">VENUE</option>
          <option value="SETTINGS">SETTINGS</option>
          <option value="AUTH">AUTH</option>
        </select>

        <button
          type="submit"
          className="px-4 py-2 bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 font-semibold rounded-lg"
        >
          Filter Logs
        </button>
      </form>

      {/* Audit Table */}
      <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-stone-50 dark:bg-stone-950 text-xs font-semibold text-stone-500 uppercase tracking-wider border-b border-stone-200 dark:border-stone-800">
              <tr>
                <th className="py-3.5 px-4">Action</th>
                <th className="py-3.5 px-4">Entity Type</th>
                <th className="py-3.5 px-4">Entity ID</th>
                <th className="py-3.5 px-4">Administrator</th>
                <th className="py-3.5 px-4">IP Address</th>
                <th className="py-3.5 px-4">Timestamp (IST)</th>
                <th className="py-3.5 px-4 text-right">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 dark:divide-stone-800">
              {logs.map((log) => (
                <tr key={log.id} className="hover:bg-stone-50/60 dark:hover:bg-stone-800/40 transition-colors">
                  <td className="py-3.5 px-4 font-mono font-bold text-xs text-brand-primary dark:text-amber-400">
                    {log.action}
                  </td>
                  <td className="py-3.5 px-4 text-xs font-semibold text-stone-700 dark:text-stone-300">
                    {log.entity_type}
                  </td>
                  <td className="py-3.5 px-4 text-xs font-mono text-stone-500">
                    #{log.entity_id || '—'}
                  </td>
                  <td className="py-3.5 px-4 text-xs font-medium text-stone-800 dark:text-stone-200">
                    @{log.admin_username}
                  </td>
                  <td className="py-3.5 px-4 text-xs font-mono text-stone-500">
                    {log.ip_address || '127.0.0.1'}
                  </td>
                  <td className="py-3.5 px-4 text-xs font-mono text-stone-500">
                    {formatISTDateTime(log.created_at)}
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <button
                      onClick={() => setSelectedLog(log)}
                      className="px-2.5 py-1 rounded bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 text-xs font-semibold text-stone-700 dark:text-stone-300 flex items-center space-x-1 ml-auto"
                    >
                      <Eye size={12} />
                      <span>Inspect</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Inspection Modal */}
      {selectedLog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl max-w-xl w-full p-6 shadow-2xl space-y-4 text-xs animate-in zoom-in-95">
            <div className="flex justify-between items-center border-b border-stone-200 dark:border-stone-800 pb-3">
              <div>
                <span className="font-mono font-bold text-brand-primary dark:text-amber-400">
                  {selectedLog.action}
                </span>
                <p className="text-stone-500 text-[11px]">
                  Logged by @{selectedLog.admin_username} on {formatISTDateTime(selectedLog.created_at)}
                </p>
              </div>
              <button onClick={() => setSelectedLog(null)}><X size={18} /></button>
            </div>

            <div className="space-y-3">
              {selectedLog.old_values && (
                <div>
                  <h4 className="font-bold text-stone-700 dark:text-stone-300 uppercase mb-1">
                    Previous Values Snapshot (Before Mutation)
                  </h4>
                  <pre className="p-3 bg-stone-50 dark:bg-stone-950 rounded-xl border border-stone-200 dark:border-stone-800 font-mono text-[11px] overflow-x-auto text-amber-700 dark:text-amber-300">
                    {JSON.stringify(JSON.parse(selectedLog.old_values), null, 2)}
                  </pre>
                </div>
              )}

              {selectedLog.new_values && (
                <div>
                  <h4 className="font-bold text-stone-700 dark:text-stone-300 uppercase mb-1">
                    Updated Values Snapshot (After Mutation)
                  </h4>
                  <pre className="p-3 bg-stone-50 dark:bg-stone-950 rounded-xl border border-stone-200 dark:border-stone-800 font-mono text-[11px] overflow-x-auto text-emerald-700 dark:text-emerald-300">
                    {JSON.stringify(JSON.parse(selectedLog.new_values), null, 2)}
                  </pre>
                </div>
              )}
            </div>

            <div className="pt-3 border-t border-stone-200 dark:border-stone-800 flex justify-end">
              <button
                onClick={() => setSelectedLog(null)}
                className="px-4 py-1.5 bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 rounded-lg font-semibold"
              >
                Close Audit Inspector
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
