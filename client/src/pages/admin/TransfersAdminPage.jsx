import React, { useState, useEffect } from 'react';
import adminApi from '../../services/adminApi';
import ConfirmModal from '../../components/admin/ConfirmModal';
import ImageUploadField from '../../components/admin/ImageUploadField';
import toast from 'react-hot-toast';

export default function TransfersAdminPage() {
  const [transfers, setTransfers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingTransfer, setEditingTransfer] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const [form, setForm] = useState({
    title: '',
    vehicle: 'Luxury SUV',
    capacity: '4 Persons',
    price: '$45',
    image: '',
    description: '',
    isActive: true,
  });

  const loadTransfers = async () => {
    try {
      setLoading(true);
      const data = await adminApi.resource('transfers').list();
      setTransfers(data || []);
    } catch {
      toast.error('Failed to load transfers');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTransfers();
  }, []);

  const handleEdit = (t) => {
    setEditingTransfer(t);
    setForm({
      title: t.title || '',
      vehicle: t.vehicle || 'Luxury SUV',
      capacity: t.capacity || '4 Persons',
      price: typeof t.price === 'object' ? `${t.price.currency} ${t.price.amount}` : t.price || '$45',
      image: t.image || '',
      description: t.description || '',
      isActive: t.isActive !== false,
    });
  };

  const handleAddNew = () => {
    setEditingTransfer({ isNew: true });
    setForm({
      title: '',
      vehicle: 'Luxury SUV',
      capacity: '4 Persons',
      price: '$45',
      image: '',
      description: '',
      isActive: true,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim() || !form.price.trim()) {
      toast.error('Vehicle title and price are required');
      return;
    }

    try {
      if (editingTransfer.isNew) {
        await adminApi.resource('transfers').create(form);
        toast.success('Transfer vehicle created');
      } else {
        await adminApi.resource('transfers').update(editingTransfer._id, form);
        toast.success('Transfer vehicle updated');
      }
      setEditingTransfer(null);
      loadTransfers();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error saving transfer');
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    try {
      await adminApi.resource('transfers').delete(deleteTarget._id);
      toast.success('Transfer deleted');
      setDeleteTarget(null);
      loadTransfers();
    } catch {
      toast.error('Error deleting transfer');
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '1.6rem', fontWeight: 800, color: '#0f172a' }}>Airport & Fleet Transfers</h1>
          <p style={{ margin: '4px 0 0 0', color: '#64748b', fontSize: '0.88rem' }}>Manage VIP transfer cars, Land Cruisers, and vans.</p>
        </div>
        <button onClick={handleAddNew} style={{ padding: '10px 18px', borderRadius: '10px', background: '#0284c7', color: '#fff', border: 'none', fontWeight: 600, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
          <i className="fa-solid fa-plus"></i> Add New Vehicle
        </button>
      </div>

      <div style={{ background: '#fff', borderRadius: '18px', padding: '24px', boxShadow: '0 4px 16px rgba(0,0,0,0.04)' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px 0' }}>
            <i className="fa-solid fa-spinner fa-spin" style={{ fontSize: '2rem', color: '#0284c7' }}></i>
            <p style={{ marginTop: '12px', color: '#64748b' }}>Loading fleet...</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.88rem' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #f1f5f9', color: '#64748b', textTransform: 'uppercase', fontSize: '0.75rem' }}>
                  <th style={{ padding: '12px' }}>Vehicle</th>
                  <th style={{ padding: '12px' }}>Capacity</th>
                  <th style={{ padding: '12px' }}>Price</th>
                  <th style={{ padding: '12px' }}>Status</th>
                  <th style={{ padding: '12px', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {transfers.map((t) => (
                  <tr key={t._id} style={{ borderBottom: '1px solid #f8fafc' }}>
                    <td style={{ padding: '14px 12px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <img src={t.image || '/assets/cards/card6.jpg'} alt="" style={{ width: '56px', height: '40px', borderRadius: '6px', objectFit: 'cover' }} onError={(e) => { e.target.src = '/assets/cards/card6.jpg'; }} />
                        <div>
                          <div style={{ fontWeight: 700, color: '#0f172a' }}>{t.title}</div>
                          <div style={{ fontSize: '0.78rem', color: '#64748b' }}>{t.vehicle}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '14px 12px', color: '#475569' }}>{t.capacity || '4 Persons'}</td>
                    <td style={{ padding: '14px 12px', fontWeight: 700, color: '#0284c7' }}>{typeof t.price === 'object' ? `${t.price.currency} ${t.price.amount}` : t.price}</td>
                    <td style={{ padding: '14px 12px' }}>
                      <span style={{ padding: '4px 8px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 600, background: t.isActive !== false ? '#dcfce7' : '#fee2e2', color: t.isActive !== false ? '#15803d' : '#b91c1c' }}>
                        {t.isActive !== false ? 'Active' : 'Draft'}
                      </span>
                    </td>
                    <td style={{ padding: '14px 12px', textAlign: 'right' }}>
                      <button onClick={() => handleEdit(t)} style={{ padding: '6px 12px', borderRadius: '6px', background: '#f1f5f9', border: 'none', cursor: 'pointer', marginRight: '6px' }}>Edit</button>
                      <button onClick={() => setDeleteTarget(t)} style={{ padding: '6px 12px', borderRadius: '6px', background: '#fee2e2', color: '#dc2626', border: 'none', cursor: 'pointer' }}>Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {editingTransfer && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(11,25,44,0.7)', zIndex: 99999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }} onClick={() => setEditingTransfer(null)}>
          <div style={{ background: '#fff', borderRadius: '20px', maxWidth: '600px', width: '100%', padding: '28px', maxHeight: '85vh', overflowY: 'auto' }} onClick={(e) => e.stopPropagation()}>
            <h3 style={{ margin: '0 0 20px 0', fontSize: '1.3rem' }}>{editingTransfer.isNew ? 'Add Transfer Vehicle' : 'Edit Transfer Vehicle'}</h3>
            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: '6px' }}>Vehicle Title *</label>
                <input type="text" required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Toyota Land Cruiser VIP" style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1' }} />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px', marginBottom: '14px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: '6px' }}>Vehicle Class</label>
                  <input type="text" value={form.vehicle} onChange={(e) => setForm({ ...form, vehicle: e.target.value })} placeholder="Luxury SUV / Sedan" style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: '6px' }}>Capacity</label>
                  <input type="text" value={form.capacity} onChange={(e) => setForm({ ...form, capacity: e.target.value })} placeholder="4 Persons" style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: '6px' }}>Price *</label>
                  <input type="text" required value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} placeholder="$45" style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1' }} />
                </div>
              </div>

              <ImageUploadField label="Vehicle Photo" value={form.image} onChange={(val) => setForm({ ...form, image: val })} folder="airdream/vehicles" />

              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: '6px' }}>Description</label>
                <textarea rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1' }} />
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
                <input type="checkbox" id="transActive" checked={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} />
                <label htmlFor="transActive" style={{ fontSize: '0.88rem', fontWeight: 600 }}>Active (Visible on Website)</label>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button type="button" onClick={() => setEditingTransfer(null)} style={{ padding: '8px 16px', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#fff', cursor: 'pointer' }}>Cancel</button>
                <button type="submit" style={{ padding: '8px 20px', borderRadius: '8px', background: '#0284c7', color: '#fff', border: 'none', fontWeight: 600, cursor: 'pointer' }}>Save Vehicle</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ConfirmModal isOpen={!!deleteTarget} title="Delete Transfer" message={`Are you sure you want to delete "${deleteTarget?.title}"?`} onConfirm={handleDeleteConfirm} onCancel={() => setDeleteTarget(null)} />
    </div>
  );
}
