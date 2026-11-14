import React, { useState, useEffect, useCallback } from 'react';
import adminApi from '../../services/adminApi';
import ConfirmModal from '../../components/admin/ConfirmModal';
import toast from 'react-hot-toast';

export default function EnquiriesPage() {
  const [enquiries, setEnquiries] = useState([]);
  const [meta, setMeta] = useState({ page: 1, limit: 15, total: 0, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Selected enquiry for detailed view / editing notes
  const [activeEnquiry, setActiveEnquiry] = useState(null);
  const [editNotes, setEditNotes] = useState('');
  const [savingNotes, setSavingNotes] = useState(false);

  // Deletion modal state
  const [deleteTarget, setDeleteTarget] = useState(null);

  const fetchEnquiries = useCallback(async (page = 1) => {
    try {
      setLoading(true);
      const params = { page, limit: 15 };
      if (statusFilter !== 'all') params.status = statusFilter;
      if (searchTerm.trim()) params.search = searchTerm.trim();

      const res = await adminApi.getEnquiries(params);
      setEnquiries(res.data || []);
      if (res.meta) setMeta(res.meta);
    } catch (err) {
      toast.error('Error fetching enquiries');
    } finally {
      setLoading(false);
    }
  }, [statusFilter, searchTerm]);

  useEffect(() => {
    fetchEnquiries(1);
  }, [fetchEnquiries]);

  const handleStatusChange = async (id, newStatus) => {
    try {
      await adminApi.updateEnquiry(id, { status: newStatus });
      toast.success(`Status changed to ${newStatus}`);
      fetchEnquiries(meta.page);
      if (activeEnquiry && activeEnquiry._id === id) {
        setActiveEnquiry({ ...activeEnquiry, status: newStatus });
      }
    } catch {
      toast.error('Could not update enquiry status');
    }
  };

  const handleOpenDetail = (enq) => {
    setActiveEnquiry(enq);
    setEditNotes(enq.adminNotes || '');
  };

  const handleSaveNotes = async () => {
    if (!activeEnquiry) return;
    setSavingNotes(true);
    try {
      const updated = await adminApi.updateEnquiry(activeEnquiry._id, { adminNotes: editNotes });
      toast.success('Internal notes saved');
      setActiveEnquiry(updated);
      fetchEnquiries(meta.page);
    } catch {
      toast.error('Error saving notes');
    } finally {
      setSavingNotes(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    try {
      await adminApi.deleteEnquiry(deleteTarget._id);
      toast.success('Enquiry deleted');
      setDeleteTarget(null);
      if (activeEnquiry && activeEnquiry._id === deleteTarget._id) {
        setActiveEnquiry(null);
      }
      fetchEnquiries(meta.page);
    } catch {
      toast.error('Error deleting enquiry');
    }
  };

  const statusOptions = ['all', 'New', 'Contacted', 'Quoted', 'Converted', 'Closed'];

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', gap: '16px' }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '1.6rem', fontWeight: 800, color: '#0f172a' }}>Customer Enquiries & Leads</h1>
          <p style={{ margin: '4px 0 0 0', color: '#64748b', fontSize: '0.88rem' }}>
            Manage booking reservations, quotations, and customer correspondence.
          </p>
        </div>

        {/* Search */}
        <div style={{ position: 'relative', width: '300px' }}>
          <input
            type="text"
            placeholder="Search name, phone, email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: '100%',
              padding: '10px 14px 10px 38px',
              borderRadius: '10px',
              border: '1px solid #cbd5e1',
              fontSize: '0.88rem',
              outline: 'none',
              background: '#fff',
            }}
          />
          <i className="fa-solid fa-magnifying-glass" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }}></i>
        </div>
      </div>

      {/* Filter Tabs */}
      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '24px' }}>
        {statusOptions.map((st) => (
          <button
            key={st}
            onClick={() => setStatusFilter(st)}
            style={{
              padding: '7px 16px',
              borderRadius: '20px',
              border: 'none',
              background: statusFilter === st ? '#0284c7' : '#ffffff',
              color: statusFilter === st ? '#ffffff' : '#475569',
              fontWeight: 600,
              fontSize: '0.85rem',
              cursor: 'pointer',
              boxShadow: '0 2px 4px rgba(0,0,0,0.04)',
              transition: 'all 0.15s',
            }}
          >
            {st === 'all' ? 'All Inquiries' : st}
          </button>
        ))}
      </div>

      {/* Table Card */}
      <div style={{ background: '#fff', borderRadius: '18px', padding: '24px', boxShadow: '0 4px 16px rgba(0,0,0,0.04)' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px 0' }}>
            <i className="fa-solid fa-spinner fa-spin" style={{ fontSize: '2rem', color: '#0284c7' }}></i>
            <p style={{ marginTop: '14px', color: '#64748b' }}>Loading enquiries...</p>
          </div>
        ) : enquiries.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 0', color: '#94a3b8' }}>
            <i className="fa-solid fa-inbox" style={{ fontSize: '2.5rem', marginBottom: '12px' }}></i>
            <h3>No enquiries found</h3>
            <p>Try adjusting your search or status filter.</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.88rem' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #f1f5f9', color: '#64748b', textTransform: 'uppercase', fontSize: '0.75rem' }}>
                  <th style={{ padding: '12px' }}>Customer</th>
                  <th style={{ padding: '12px' }}>Service / Tour</th>
                  <th style={{ padding: '12px' }}>Date / Guests</th>
                  <th style={{ padding: '12px' }}>Status</th>
                  <th style={{ padding: '12px' }}>Received</th>
                  <th style={{ padding: '12px', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {enquiries.map((enq) => {
                  const statusColors = {
                    New: { bg: '#ffedd5', color: '#c2410c' },
                    Contacted: { bg: '#fef9c3', color: '#a16207' },
                    Quoted: { bg: '#e0f2fe', color: '#0369a1' },
                    Converted: { bg: '#dcfce7', color: '#15803d' },
                    Closed: { bg: '#f1f5f9', color: '#64748b' },
                  };
                  const sStyle = statusColors[enq.status] || statusColors.New;
                  const dateStr = enq.createdAt ? new Date(enq.createdAt).toLocaleDateString() : '';

                  return (
                    <tr key={enq._id} style={{ borderBottom: '1px solid #f8fafc' }}>
                      <td style={{ padding: '14px 12px' }}>
                        <div style={{ fontWeight: 700, color: '#0f172a' }}>{enq.fullName}</div>
                        <div style={{ fontSize: '0.8rem', color: '#0284c7' }}>{enq.email}</div>
                        <div style={{ fontSize: '0.8rem', color: '#64748b' }}>{enq.phone}</div>
                      </td>
                      <td style={{ padding: '14px 12px' }}>
                        <div style={{ fontWeight: 600, color: '#334155' }}>{enq.serviceRequired}</div>
                        {enq.destination && (
                          <div style={{ fontSize: '0.78rem', color: '#94a3b8' }}>
                            <i className="fa-solid fa-location-dot" style={{ marginRight: '4px' }}></i> {enq.destination}
                          </div>
                        )}
                      </td>
                      <td style={{ padding: '14px 12px', color: '#64748b', fontSize: '0.82rem' }}>
                        <div>{enq.travelDate || 'Flexible'}</div>
                        <div>{enq.travellerCount || 'Standard'}</div>
                      </td>
                      <td style={{ padding: '14px 12px' }}>
                        <select
                          value={enq.status}
                          onChange={(e) => handleStatusChange(enq._id, e.target.value)}
                          style={{
                            padding: '4px 10px',
                            borderRadius: '12px',
                            border: 'none',
                            background: sStyle.bg,
                            color: sStyle.color,
                            fontWeight: 700,
                            fontSize: '0.78rem',
                            cursor: 'pointer',
                          }}
                        >
                          <option value="New">New</option>
                          <option value="Contacted">Contacted</option>
                          <option value="Quoted">Quoted</option>
                          <option value="Converted">Converted</option>
                          <option value="Closed">Closed</option>
                        </select>
                      </td>
                      <td style={{ padding: '14px 12px', color: '#64748b', fontSize: '0.82rem' }}>
                        {dateStr}
                      </td>
                      <td style={{ padding: '14px 12px', textAlign: 'right' }}>
                        <div style={{ display: 'inline-flex', gap: '6px' }}>
                          <button
                            onClick={() => handleOpenDetail(enq)}
                            style={{
                              padding: '6px 10px',
                              borderRadius: '6px',
                              background: '#f1f5f9',
                              border: 'none',
                              color: '#334155',
                              cursor: 'pointer',
                              fontSize: '0.82rem',
                            }}
                            title="View Details & Notes"
                          >
                            <i className="fa-solid fa-eye"></i>
                          </button>
                          <a
                            href={`https://wa.me/${(enq.phone || '').replace(/[^0-9]/g, '')}`}
                            target="_blank"
                            rel="noreferrer"
                            style={{
                              padding: '6px 10px',
                              borderRadius: '6px',
                              background: '#dcfce7',
                              color: '#15803d',
                              textDecoration: 'none',
                              fontSize: '0.82rem',
                            }}
                            title="WhatsApp Customer"
                          >
                            <i className="fa-brands fa-whatsapp"></i>
                          </a>
                          <button
                            onClick={() => setDeleteTarget(enq)}
                            style={{
                              padding: '6px 10px',
                              borderRadius: '6px',
                              background: '#fee2e2',
                              border: 'none',
                              color: '#dc2626',
                              cursor: 'pointer',
                              fontSize: '0.82rem',
                            }}
                            title="Delete Enquiry"
                          >
                            <i className="fa-solid fa-trash"></i>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {/* Pagination Controls */}
            {meta.totalPages > 1 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '20px', borderTop: '1px solid #f1f5f9', paddingTop: '16px' }}>
                <span style={{ fontSize: '0.82rem', color: '#64748b' }}>
                  Showing page {meta.page} of {meta.totalPages} ({meta.total} total enquiries)
                </span>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    disabled={meta.page <= 1}
                    onClick={() => fetchEnquiries(meta.page - 1)}
                    style={{
                      padding: '6px 14px',
                      borderRadius: '8px',
                      border: '1px solid #cbd5e1',
                      background: '#fff',
                      cursor: meta.page <= 1 ? 'not-allowed' : 'pointer',
                      opacity: meta.page <= 1 ? 0.5 : 1,
                    }}
                  >
                    Previous
                  </button>
                  <button
                    disabled={meta.page >= meta.totalPages}
                    onClick={() => fetchEnquiries(meta.page + 1)}
                    style={{
                      padding: '6px 14px',
                      borderRadius: '8px',
                      border: '1px solid #cbd5e1',
                      background: '#fff',
                      cursor: meta.page >= meta.totalPages ? 'not-allowed' : 'pointer',
                      opacity: meta.page >= meta.totalPages ? 0.5 : 1,
                    }}
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Enquiry Details & Notes Modal */}
      {activeEnquiry && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(11,25,44,0.7)',
            backdropFilter: 'blur(4px)',
            zIndex: 99999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '16px',
          }}
          onClick={() => setActiveEnquiry(null)}
        >
          <div
            style={{
              background: '#fff',
              borderRadius: '20px',
              maxWidth: '600px',
              width: '100%',
              padding: '28px',
              boxShadow: '0 20px 50px rgba(0,0,0,0.25)',
              maxHeight: '85vh',
              overflowY: 'auto',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid #f1f5f9', paddingBottom: '14px' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.3rem', color: '#0f172a' }}>{activeEnquiry.fullName}</h3>
                <span style={{ fontSize: '0.8rem', color: '#64748b' }}>Lead ID: {activeEnquiry._id}</span>
              </div>
              <button
                onClick={() => setActiveEnquiry(null)}
                style={{ background: 'none', border: 'none', fontSize: '1.2rem', color: '#94a3b8', cursor: 'pointer' }}
              >
                <i className="fa-solid fa-xmark"></i>
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '16px', background: '#f8fafc', padding: '16px', borderRadius: '12px' }}>
              <div>
                <span style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 600 }}>Email</span>
                <div style={{ fontWeight: 600, color: '#0f172a' }}>{activeEnquiry.email}</div>
              </div>
              <div>
                <span style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 600 }}>Phone</span>
                <div style={{ fontWeight: 600, color: '#0f172a' }}>{activeEnquiry.phone}</div>
              </div>
              <div>
                <span style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 600 }}>Service Required</span>
                <div style={{ fontWeight: 600, color: '#0284c7' }}>{activeEnquiry.serviceRequired}</div>
              </div>
              <div>
                <span style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 600 }}>Travel Date</span>
                <div style={{ fontWeight: 600, color: '#0f172a' }}>{activeEnquiry.travelDate || 'Flexible'}</div>
              </div>
            </div>

            {activeEnquiry.message && (
              <div style={{ marginBottom: '18px' }}>
                <span style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 600 }}>Customer Message / Request</span>
                <div style={{ background: '#f1f5f9', padding: '12px', borderRadius: '8px', fontSize: '0.9rem', color: '#334155', marginTop: '4px' }}>
                  {activeEnquiry.message}
                </div>
              </div>
            )}

            {/* Internal Admin Notes */}
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#0f172a', marginBottom: '6px' }}>
                <i className="fa-solid fa-note-sticky" style={{ color: '#f59e0b', marginRight: '6px' }}></i> Internal Admin Notes (Private)
              </label>
              <textarea
                rows={3}
                value={editNotes}
                onChange={(e) => setEditNotes(e.target.value)}
                placeholder="Log internal communication, quotation amount, customer preferences..."
                style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.88rem' }}
              />
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '8px' }}>
                <button
                  onClick={handleSaveNotes}
                  disabled={savingNotes}
                  style={{
                    padding: '8px 16px',
                    borderRadius: '8px',
                    background: '#0284c7',
                    color: '#fff',
                    border: 'none',
                    fontWeight: 600,
                    fontSize: '0.82rem',
                    cursor: savingNotes ? 'not-allowed' : 'pointer',
                  }}
                >
                  {savingNotes ? 'Saving...' : 'Save Internal Notes'}
                </button>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #f1f5f9', paddingTop: '16px' }}>
              <a
                href={`https://wa.me/${(activeEnquiry.phone || '').replace(/[^0-9]/g, '')}`}
                target="_blank"
                rel="noreferrer"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '9px 16px',
                  borderRadius: '8px',
                  background: '#dcfce7',
                  color: '#15803d',
                  textDecoration: 'none',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                }}
              >
                <i className="fa-brands fa-whatsapp"></i> Chat on WhatsApp
              </a>

              <button
                onClick={() => setActiveEnquiry(null)}
                style={{
                  padding: '8px 16px',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1',
                  background: '#fff',
                  color: '#475569',
                  fontWeight: 600,
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      <ConfirmModal
        isOpen={!!deleteTarget}
        title="Delete Customer Enquiry"
        message={`Are you sure you want to delete the enquiry from ${deleteTarget?.fullName}? This cannot be undone.`}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
