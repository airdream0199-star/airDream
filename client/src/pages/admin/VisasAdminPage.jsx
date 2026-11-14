import React, { useState, useEffect } from 'react';
import adminApi from '../../services/adminApi';
import ConfirmModal from '../../components/admin/ConfirmModal';
import toast from 'react-hot-toast';

export default function VisasAdminPage() {
  const [visas, setVisas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingVisa, setEditingVisa] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const [form, setForm] = useState({
    country: '',
    type: 'Tourist',
    price: '',
    currency: 'INR',
    processingTime: '3-5 Working Days',
    badgeText: 'FAST TRACK',
    isActive: true,
  });

  const loadVisas = async () => {
    try {
      setLoading(true);
      const data = await adminApi.resource('visas').list();
      setVisas(data || []);
    } catch {
      toast.error('Failed to load visas');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadVisas();
  }, []);

  const handleEdit = (v) => {
    setEditingVisa(v);
    setForm({
      country: v.country || '',
      type: v.type || 'Tourist',
      price: typeof v.price === 'object' ? v.price.amount : v.price || '',
      currency: typeof v.price === 'object' ? v.price.currency : v.currency || 'INR',
      processingTime: v.processingTime || '3-5 Working Days',
      badgeText: v.badgeText || 'FAST TRACK',
      isActive: v.isActive !== false,
    });
  };

  const handleAddNew = () => {
    setEditingVisa({ isNew: true });
    setForm({
      country: '',
      type: 'Tourist',
      price: '',
      currency: 'INR',
      processingTime: '3-5 Working Days',
      badgeText: 'FAST TRACK',
      isActive: true,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.country.trim() || !form.price) {
      toast.error('Country and price are required');
      return;
    }

    const payload = {
      country: form.country.trim(),
      type: form.type,
      price: Number(form.price) || form.price,
      currency: form.currency.trim(),
      processingTime: form.processingTime.trim(),
      badgeText: form.badgeText.trim(),
      isActive: form.isActive,
    };

    try {
      if (editingVisa.isNew) {
        await adminApi.resource('visas').create(payload);
        toast.success('Visa service created');
      } else {
        await adminApi.resource('visas').update(editingVisa._id, payload);
        toast.success('Visa service updated');
      }
      setEditingVisa(null);
      loadVisas();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error saving visa');
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    try {
      await adminApi.resource('visas').delete(deleteTarget._id);
      toast.success('Visa service deleted');
      setDeleteTarget(null);
      loadVisas();
    } catch {
      toast.error('Error deleting visa');
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '1.6rem', fontWeight: 800, color: '#0f172a' }}>Visa Consultancy Services</h1>
          <p style={{ margin: '4px 0 0 0', color: '#64748b', fontSize: '0.88rem' }}>Manage tourist, transit, and business visa fees and requirements.</p>
        </div>
        <button onClick={handleAddNew} style={{ padding: '10px 18px', borderRadius: '10px', background: '#0284c7', color: '#fff', border: 'none', fontWeight: 600, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
          <i className="fa-solid fa-plus"></i> Add Visa Service
        </button>
      </div>

      <div style={{ background: '#fff', borderRadius: '18px', padding: '24px', boxShadow: '0 4px 16px rgba(0,0,0,0.04)' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px 0' }}>
            <i className="fa-solid fa-spinner fa-spin" style={{ fontSize: '2rem', color: '#0284c7' }}></i>
            <p style={{ marginTop: '12px', color: '#64748b' }}>Loading visa services...</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.88rem' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #f1f5f9', color: '#64748b', textTransform: 'uppercase', fontSize: '0.75rem' }}>
                  <th style={{ padding: '12px' }}>Country</th>
                  <th style={{ padding: '12px' }}>Type</th>
                  <th style={{ padding: '12px' }}>Processing Time</th>
                  <th style={{ padding: '12px' }}>Fee</th>
                  <th style={{ padding: '12px' }}>Badge</th>
                  <th style={{ padding: '12px', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {visas.map((v) => (
                  <tr key={v._id} style={{ borderBottom: '1px solid #f8fafc' }}>
                    <td style={{ padding: '14px 12px', fontWeight: 700, color: '#0f172a' }}>{v.country}</td>
                    <td style={{ padding: '14px 12px', color: '#475569' }}>{v.type}</td>
                    <td style={{ padding: '14px 12px', color: '#64748b' }}>{v.processingTime || '3-5 Days'}</td>
                    <td style={{ padding: '14px 12px', fontWeight: 700, color: '#0284c7' }}>
                      {typeof v.price === 'object' ? `${v.price.currency || 'INR'} ${v.price.amount}` : `₹${v.price}`}
                    </td>
                    <td style={{ padding: '14px 12px' }}>
                      <span style={{ padding: '3px 8px', borderRadius: '10px', fontSize: '0.72rem', fontWeight: 700, background: '#dbeafe', color: '#1d4ed8' }}>
                        {v.badgeText || 'FAST TRACK'}
                      </span>
                    </td>
                    <td style={{ padding: '14px 12px', textAlign: 'right' }}>
                      <button onClick={() => handleEdit(v)} style={{ padding: '6px 12px', borderRadius: '6px', background: '#f1f5f9', border: 'none', cursor: 'pointer', marginRight: '6px' }}>Edit</button>
                      <button onClick={() => setDeleteTarget(v)} style={{ padding: '6px 12px', borderRadius: '6px', background: '#fee2e2', color: '#dc2626', border: 'none', cursor: 'pointer' }}>Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {editingVisa && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(11,25,44,0.7)', zIndex: 99999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }} onClick={() => setEditingVisa(null)}>
          <div style={{ background: '#fff', borderRadius: '20px', maxWidth: '500px', width: '100%', padding: '28px', maxHeight: '85vh', overflowY: 'auto' }} onClick={(e) => e.stopPropagation()}>
            <h3 style={{ margin: '0 0 20px 0', fontSize: '1.3rem' }}>{editingVisa.isNew ? 'Add Visa Service' : 'Edit Visa Service'}</h3>
            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: '6px' }}>Country *</label>
                <input type="text" required value={form.country} onChange={(e) => setForm({ ...form, country: e.target.value })} placeholder="e.g. United Kingdom" style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1' }} />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '14px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: '6px' }}>Type</label>
                  <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#fff' }}>
                    <option value="Tourist">Tourist</option>
                    <option value="Business">Business</option>
                    <option value="Transit">Transit</option>
                    <option value="Express">Express</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: '6px' }}>Fee *</label>
                  <input type="number" required value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} placeholder="1500" style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1' }} />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '14px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: '6px' }}>Processing Time</label>
                  <input type="text" value={form.processingTime} onChange={(e) => setForm({ ...form, processingTime: e.target.value })} placeholder="3-5 Working Days" style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: '6px' }}>Badge Text</label>
                  <input type="text" value={form.badgeText} onChange={(e) => setForm({ ...form, badgeText: e.target.value })} placeholder="FAST TRACK" style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1' }} />
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
                <input type="checkbox" id="visaActive" checked={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} />
                <label htmlFor="visaActive" style={{ fontSize: '0.88rem', fontWeight: 600 }}>Active (Visible on Website)</label>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button type="button" onClick={() => setEditingVisa(null)} style={{ padding: '8px 16px', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#fff', cursor: 'pointer' }}>Cancel</button>
                <button type="submit" style={{ padding: '8px 20px', borderRadius: '8px', background: '#0284c7', color: '#fff', border: 'none', fontWeight: 600, cursor: 'pointer' }}>Save Visa Service</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ConfirmModal isOpen={!!deleteTarget} title="Delete Visa Service" message={`Are you sure you want to delete visa service for "${deleteTarget?.country}"?`} onConfirm={handleDeleteConfirm} onCancel={() => setDeleteTarget(null)} />
    </div>
  );
}
