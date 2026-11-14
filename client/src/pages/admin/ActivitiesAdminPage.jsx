import React, { useState, useEffect } from 'react';
import adminApi from '../../services/adminApi';
import ConfirmModal from '../../components/admin/ConfirmModal';
import ImageUploadField from '../../components/admin/ImageUploadField';
import toast from 'react-hot-toast';

export default function ActivitiesAdminPage() {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingAct, setEditingAct] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const [form, setForm] = useState({
    title: '',
    category: 'Attraction',
    price: '',
    currency: 'AED',
    rating: 4.8,
    image: '',
    description: '',
    isActive: true,
  });

  const loadActivities = async () => {
    try {
      setLoading(true);
      const data = await adminApi.resource('activities').list();
      setActivities(data || []);
    } catch {
      toast.error('Failed to load attractions');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadActivities();
  }, []);

  const handleEdit = (act) => {
    setEditingAct(act);
    setForm({
      title: act.title || '',
      category: act.category || 'Attraction',
      price: typeof act.price === 'object' ? act.price.amount : act.price || '',
      currency: typeof act.price === 'object' ? act.price.currency : act.currency || 'AED',
      rating: act.rating || 4.8,
      image: (act.images && act.images[0]) || '',
      description: act.description || '',
      isActive: act.isActive !== false,
    });
  };

  const handleAddNew = () => {
    setEditingAct({ isNew: true });
    setForm({
      title: '',
      category: 'Attraction',
      price: '',
      currency: 'AED',
      rating: 4.8,
      image: '',
      description: '',
      isActive: true,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim() || !form.price) {
      toast.error('Title and price are required');
      return;
    }

    const payload = {
      title: form.title.trim(),
      category: form.category.trim(),
      price: Number(form.price) || form.price,
      currency: form.currency.trim(),
      rating: Number(form.rating) || 4.8,
      images: form.image ? [form.image] : [],
      description: form.description.trim(),
      isActive: form.isActive,
    };

    try {
      if (editingAct.isNew) {
        await adminApi.resource('activities').create(payload);
        toast.success('Attraction created successfully');
      } else {
        await adminApi.resource('activities').update(editingAct._id, payload);
        toast.success('Attraction updated successfully');
      }
      setEditingAct(null);
      loadActivities();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error saving attraction');
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    try {
      await adminApi.resource('activities').delete(deleteTarget._id);
      toast.success('Attraction deleted');
      setDeleteTarget(null);
      loadActivities();
    } catch {
      toast.error('Error deleting attraction');
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '1.6rem', fontWeight: 800, color: '#0f172a' }}>Attractions & Tickets</h1>
          <p style={{ margin: '4px 0 0 0', color: '#64748b', fontSize: '0.88rem' }}>Manage Burj Khalifa tickets, theme parks, and tourist landmarks.</p>
        </div>
        <button onClick={handleAddNew} style={{ padding: '10px 18px', borderRadius: '10px', background: '#0284c7', color: '#fff', border: 'none', fontWeight: 600, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
          <i className="fa-solid fa-plus"></i> Add New Attraction
        </button>
      </div>

      <div style={{ background: '#fff', borderRadius: '18px', padding: '24px', boxShadow: '0 4px 16px rgba(0,0,0,0.04)' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px 0' }}>
            <i className="fa-solid fa-spinner fa-spin" style={{ fontSize: '2rem', color: '#0284c7' }}></i>
            <p style={{ marginTop: '12px', color: '#64748b' }}>Loading attractions...</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.88rem' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #f1f5f9', color: '#64748b', textTransform: 'uppercase', fontSize: '0.75rem' }}>
                  <th style={{ padding: '12px' }}>Attraction</th>
                  <th style={{ padding: '12px' }}>Category</th>
                  <th style={{ padding: '12px' }}>Price</th>
                  <th style={{ padding: '12px' }}>Status</th>
                  <th style={{ padding: '12px', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {activities.map((act) => {
                  const priceStr = typeof act.price === 'object' ? `${act.price.currency || 'AED'} ${act.price.amount}` : (typeof act.price === 'number' ? `AED ${act.price}` : act.price);
                  const img = (act.images && act.images[0]) || '/assets/cards/card5.jpg';

                  return (
                    <tr key={act._id} style={{ borderBottom: '1px solid #f8fafc' }}>
                      <td style={{ padding: '14px 12px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <img src={img} alt="" style={{ width: '48px', height: '48px', borderRadius: '8px', objectFit: 'cover' }} onError={(e) => { e.target.src = '/assets/cards/card5.jpg'; }} />
                          <div style={{ fontWeight: 700, color: '#0f172a' }}>{act.title}</div>
                        </div>
                      </td>
                      <td style={{ padding: '14px 12px', color: '#475569' }}>{act.category || 'Attraction'}</td>
                      <td style={{ padding: '14px 12px', fontWeight: 700, color: '#0284c7' }}>{priceStr}</td>
                      <td style={{ padding: '14px 12px' }}>
                        <span style={{ padding: '4px 8px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 600, background: act.isActive !== false ? '#dcfce7' : '#fee2e2', color: act.isActive !== false ? '#15803d' : '#b91c1c' }}>
                          {act.isActive !== false ? 'Active' : 'Draft'}
                        </span>
                      </td>
                      <td style={{ padding: '14px 12px', textAlign: 'right' }}>
                        <button onClick={() => handleEdit(act)} style={{ padding: '6px 12px', borderRadius: '6px', background: '#f1f5f9', border: 'none', cursor: 'pointer', marginRight: '6px' }}>Edit</button>
                        <button onClick={() => setDeleteTarget(act)} style={{ padding: '6px 12px', borderRadius: '6px', background: '#fee2e2', color: '#dc2626', border: 'none', cursor: 'pointer' }}>Delete</button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {editingAct && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(11,25,44,0.7)', zIndex: 99999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }} onClick={() => setEditingAct(null)}>
          <div style={{ background: '#fff', borderRadius: '20px', maxWidth: '600px', width: '100%', padding: '28px', maxHeight: '85vh', overflowY: 'auto' }} onClick={(e) => e.stopPropagation()}>
            <h3 style={{ margin: '0 0 20px 0', fontSize: '1.3rem' }}>{editingAct.isNew ? 'Add Attraction' : 'Edit Attraction'}</h3>
            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: '6px' }}>Attraction Title *</label>
                <input type="text" required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1' }} />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px', marginBottom: '14px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: '6px' }}>Category</label>
                  <input type="text" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: '6px' }}>Price *</label>
                  <input type="number" required value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: '6px' }}>Currency</label>
                  <input type="text" value={form.currency} onChange={(e) => setForm({ ...form, currency: e.target.value })} style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1' }} />
                </div>
              </div>

              <ImageUploadField label="Attraction Image" value={form.image} onChange={(val) => setForm({ ...form, image: val })} folder="airdream/attractions" />

              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: '6px' }}>Description</label>
                <textarea rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1' }} />
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
                <input type="checkbox" id="actActive" checked={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} />
                <label htmlFor="actActive" style={{ fontSize: '0.88rem', fontWeight: 600 }}>Active (Visible on Website)</label>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button type="button" onClick={() => setEditingAct(null)} style={{ padding: '8px 16px', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#fff', cursor: 'pointer' }}>Cancel</button>
                <button type="submit" style={{ padding: '8px 20px', borderRadius: '8px', background: '#0284c7', color: '#fff', border: 'none', fontWeight: 600, cursor: 'pointer' }}>Save Attraction</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ConfirmModal isOpen={!!deleteTarget} title="Delete Attraction" message={`Are you sure you want to delete "${deleteTarget?.title}"?`} onConfirm={handleDeleteConfirm} onCancel={() => setDeleteTarget(null)} />
    </div>
  );
}
