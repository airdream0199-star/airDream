import React, { useState, useEffect } from 'react';
import adminApi from '../../services/adminApi';
import ConfirmModal from '../../components/admin/ConfirmModal';
import ImageUploadField from '../../components/admin/ImageUploadField';
import toast from 'react-hot-toast';

const formatDurationString = (val) => {
  if (typeof val === 'string' && val.trim()) return val;
  if (val && typeof val === 'object') {
    const days = val.days ?? 0;
    const nights = val.nights ?? 0;
    if (days && nights) return `${days}D / ${nights}N`;
    if (days) return `${days} Day${days > 1 ? 's' : ''}`;
    if (nights) return `${nights} Night${nights > 1 ? 's' : ''}`;
  }
  return '08-Hrs';
};

export default function ToursAdminPage() {
  const [tours, setTours] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingTour, setEditingTour] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const [form, setForm] = useState({
    title: '',
    category: 'Sightseeing',
    price: '',
    currency: 'AED',
    duration: '08-Hrs',
    location: 'Dubai, UAE',
    vehicle: '4WD Cruiser',
    capacity: '4 Persons',
    rating: 4.8,
    image: '',
    description: '',
    highlights: '',
    isActive: true,
  });

  const loadTours = async () => {
    try {
      setLoading(true);
      const data = await adminApi.resource('tours').list();
      setTours(data || []);
    } catch {
      toast.error('Failed to load tours');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTours();
  }, []);

  const handleEdit = (tour) => {
    setEditingTour(tour);
    setForm({
      title: tour.title || '',
      category: tour.category || 'Sightseeing',
      price: typeof tour.price === 'object' ? tour.price.amount : tour.price || '',
      currency: typeof tour.price === 'object' ? tour.price.currency : tour.currency || 'AED',
      duration: formatDurationString(tour.duration || tour.hours),
      location: tour.location || 'Dubai, UAE',
      vehicle: tour.vehicle || tour.carHours || '4WD Cruiser',
      capacity: tour.capacity || '4 Persons',
      rating: tour.rating || 4.8,
      image: (tour.images && tour.images[0]) || '',
      description: tour.description || '',
      highlights: (tour.highlights || []).join('\n'),
      isActive: tour.isActive !== false,
    });
  };

  const handleAddNew = () => {
    setEditingTour({ isNew: true });
    setForm({
      title: '',
      category: 'Sightseeing',
      price: '',
      currency: 'AED',
      duration: '08-Hrs',
      location: 'Dubai, UAE',
      vehicle: '4WD Cruiser',
      capacity: '4 Persons',
      rating: 4.8,
      image: '',
      description: '',
      highlights: '',
      isActive: true,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim() || !form.price) {
      toast.error('Title and price are required.');
      return;
    }

    const payload = {
      title: form.title.trim(),
      category: form.category.trim(),
      price: Number(form.price) || form.price,
      currency: form.currency.trim(),
      duration: form.duration.trim(),
      location: form.location.trim(),
      vehicle: form.vehicle.trim(),
      capacity: form.capacity.trim(),
      rating: Number(form.rating) || 4.8,
      images: form.image ? [form.image] : [],
      description: form.description.trim(),
      highlights: form.highlights.split('\n').map((h) => h.trim()).filter(Boolean),
      isActive: form.isActive,
    };

    try {
      if (editingTour.isNew) {
        await adminApi.resource('tours').create(payload);
        toast.success('Tour created successfully');
      } else {
        await adminApi.resource('tours').update(editingTour._id, payload);
        toast.success('Tour updated successfully');
      }
      setEditingTour(null);
      await loadTours();
      window.dispatchEvent(new CustomEvent('airdream:data_updated', { detail: { resource: 'tours' } }));
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error saving tour');
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    try {
      await adminApi.resource('tours').delete(deleteTarget._id);
      toast.success('Tour deleted');
      setDeleteTarget(null);
      await loadTours();
      window.dispatchEvent(new CustomEvent('airdream:data_updated', { detail: { resource: 'tours' } }));
    } catch {
      toast.error('Error deleting tour');
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '1.6rem', fontWeight: 800, color: '#0f172a' }}>Tours & Excursions</h1>
          <p style={{ margin: '4px 0 0 0', color: '#64748b', fontSize: '0.88rem' }}>Manage desert safaris, city tours, and cruise packages.</p>
        </div>
        <button
          onClick={handleAddNew}
          style={{
            padding: '10px 18px',
            borderRadius: '10px',
            background: '#0284c7',
            color: '#fff',
            border: 'none',
            fontWeight: 600,
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <i className="fa-solid fa-plus"></i> Add New Tour
        </button>
      </div>

      {/* Table */}
      <div style={{ background: '#fff', borderRadius: '18px', padding: '24px', boxShadow: '0 4px 16px rgba(0,0,0,0.04)' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px 0' }}>
            <i className="fa-solid fa-spinner fa-spin" style={{ fontSize: '2rem', color: '#0284c7' }}></i>
            <p style={{ marginTop: '12px', color: '#64748b' }}>Loading tours...</p>
          </div>
        ) : tours.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 0', color: '#94a3b8' }}>
            <h3>No tours added yet</h3>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.88rem' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #f1f5f9', color: '#64748b', textTransform: 'uppercase', fontSize: '0.75rem' }}>
                  <th style={{ padding: '12px' }}>Tour</th>
                  <th style={{ padding: '12px' }}>Category</th>
                  <th style={{ padding: '12px' }}>Price</th>
                  <th style={{ padding: '12px' }}>Duration</th>
                  <th style={{ padding: '12px' }}>Rating</th>
                  <th style={{ padding: '12px' }}>Visibility</th>
                  <th style={{ padding: '12px', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {tours.map((t) => {
                  const priceStr = typeof t.price === 'object' ? `${t.price.currency || 'AED'} ${t.price.amount}` : (typeof t.price === 'number' ? `AED ${t.price}` : t.price);
                  const img = (t.images && t.images[0]) || '/assets/cards/card5.jpg';
                  const durStr = formatDurationString(t.duration || t.hours);

                  return (
                    <tr key={t._id} style={{ borderBottom: '1px solid #f8fafc' }}>
                      <td style={{ padding: '14px 12px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <img src={img} alt="" style={{ width: '48px', height: '48px', borderRadius: '8px', objectFit: 'cover' }} onError={(e) => { e.target.src = '/assets/cards/card5.jpg'; }} />
                          <div>
                            <div style={{ fontWeight: 700, color: '#0f172a' }}>{t.title}</div>
                            <div style={{ fontSize: '0.78rem', color: '#94a3b8' }}>Slug: /{t.slug || t._id}</div>
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: '14px 12px', color: '#475569' }}>{t.category || 'Sightseeing'}</td>
                      <td style={{ padding: '14px 12px', fontWeight: 700, color: '#0284c7' }}>{priceStr}</td>
                      <td style={{ padding: '14px 12px', color: '#64748b' }}>{durStr}</td>
                      <td style={{ padding: '14px 12px', color: '#eab308' }}><i className="fa-solid fa-star"></i> {t.rating || 4.8}</td>
                      <td style={{ padding: '14px 12px' }}>
                        <span style={{ padding: '4px 8px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 600, background: t.isActive !== false ? '#dcfce7' : '#fee2e2', color: t.isActive !== false ? '#15803d' : '#b91c1c' }}>
                          {t.isActive !== false ? 'Active' : 'Draft'}
                        </span>
                      </td>
                      <td style={{ padding: '14px 12px', textAlign: 'right' }}>
                        <button onClick={() => handleEdit(t)} style={{ padding: '6px 12px', borderRadius: '6px', background: '#f1f5f9', border: 'none', cursor: 'pointer', marginRight: '6px', fontSize: '0.82rem' }}>
                          <i className="fa-solid fa-pen-to-square"></i> Edit
                        </button>
                        <button onClick={() => setDeleteTarget(t)} style={{ padding: '6px 12px', borderRadius: '6px', background: '#fee2e2', color: '#dc2626', border: 'none', cursor: 'pointer', fontSize: '0.82rem' }}>
                          <i className="fa-solid fa-trash"></i>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Edit / Create Modal */}
      {editingTour && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(11,25,44,0.7)', zIndex: 99999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }} onClick={() => setEditingTour(null)}>
          <div style={{ background: '#fff', borderRadius: '20px', maxWidth: '650px', width: '100%', padding: '28px', maxHeight: '88vh', overflowY: 'auto' }} onClick={(e) => e.stopPropagation()}>
            <h3 style={{ margin: '0 0 20px 0', fontSize: '1.3rem' }}>{editingTour.isNew ? 'Create New Tour' : 'Edit Tour'}</h3>
            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: '6px' }}>Tour Title *</label>
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

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '14px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: '6px' }}>Duration (e.g. 06-Hrs or 1 Day)</label>
                  <input type="text" value={form.duration} onChange={(e) => setForm({ ...form, duration: e.target.value })} placeholder="06-Hrs" style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: '6px' }}>Location</label>
                  <input type="text" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} placeholder="Dubai Desert, UAE" style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1' }} />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '14px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: '6px' }}>Vehicle / Transport</label>
                  <input type="text" value={form.vehicle} onChange={(e) => setForm({ ...form, vehicle: e.target.value })} placeholder="4WD Cruiser" style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: '6px' }}>Capacity / Group Size</label>
                  <input type="text" value={form.capacity} onChange={(e) => setForm({ ...form, capacity: e.target.value })} placeholder="6 Persons" style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1' }} />
                </div>
              </div>

              <ImageUploadField label="Cover Image" value={form.image} onChange={(val) => setForm({ ...form, image: val })} folder="airdream/tours" />

              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: '6px' }}>Description</label>
                <textarea rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1' }} />
              </div>

              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: '6px' }}>Highlights (One per line)</label>
                <textarea rows={3} value={form.highlights} onChange={(e) => setForm({ ...form, highlights: e.target.value })} placeholder="Dune Bashing 4x4&#10;BBQ Buffet Dinner&#10;Live Tanoura Show" style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1' }} />
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
                <input type="checkbox" id="tourActive" checked={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} />
                <label htmlFor="tourActive" style={{ fontSize: '0.88rem', fontWeight: 600 }}>Active (Visible on Website)</label>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button type="button" onClick={() => setEditingTour(null)} style={{ padding: '8px 16px', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#fff', cursor: 'pointer' }}>Cancel</button>
                <button type="submit" style={{ padding: '8px 20px', borderRadius: '8px', background: '#0284c7', color: '#fff', border: 'none', fontWeight: 600, cursor: 'pointer' }}>Save Tour</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ConfirmModal isOpen={!!deleteTarget} title="Delete Tour" message={`Are you sure you want to delete "${deleteTarget?.title}"?`} onConfirm={handleDeleteConfirm} onCancel={() => setDeleteTarget(null)} />
    </div>
  );
}
