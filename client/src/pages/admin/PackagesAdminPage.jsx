import React, { useState, useEffect } from 'react';
import adminApi from '../../services/adminApi';
import ConfirmModal from '../../components/admin/ConfirmModal';
import ImageUploadField from '../../components/admin/ImageUploadField';
import toast from 'react-hot-toast';

export default function PackagesAdminPage() {
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingPkg, setEditingPkg] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const [form, setForm] = useState({
    title: '',
    category: 'tours',
    price: '$299',
    location: 'Dubai, UAE',
    duration: '5 Days / 4 Nights',
    image: '',
    description: '',
    badge: '',
    isActive: true,
  });

  const loadPackages = async () => {
    try {
      setLoading(true);
      const data = await adminApi.resource('travel-deals').list();
      setPackages(data || []);
    } catch {
      toast.error('Failed to load packages');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPackages();
  }, []);

  const handleEdit = (pkg) => {
    setEditingPkg(pkg);
    setForm({
      title: pkg.title || '',
      category: pkg.category || 'tours',
      price: typeof pkg.price === 'object' ? `${pkg.price.currency} ${pkg.price.amount}` : pkg.price || '$299',
      location: pkg.location || 'Dubai, UAE',
      duration: typeof pkg.duration === 'string' ? pkg.duration : '5 Days / 4 Nights',
      image: pkg.image || (pkg.images && pkg.images[0]) || '',
      description: pkg.description || pkg.tagline || '',
      badge: pkg.badge || '',
      isActive: pkg.isActive !== false,
    });
  };

  const handleAddNew = () => {
    setEditingPkg({ isNew: true });
    setForm({
      title: '',
      category: 'tours',
      price: '$299',
      location: 'Dubai, UAE',
      duration: '5 Days / 4 Nights',
      image: '',
      description: '',
      badge: '',
      isActive: true,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim() || !form.price.trim()) {
      toast.error('Title and price are required.');
      return;
    }

    const payload = {
      ...form,
      title: form.title.trim(),
      price: form.price.trim(),
    };

    try {
      if (editingPkg.isNew) {
        await adminApi.resource('travel-deals').create(payload);
        toast.success('Package created successfully');
      } else {
        await adminApi.resource('travel-deals').update(editingPkg._id, payload);
        toast.success('Package updated successfully');
      }
      setEditingPkg(null);
      loadPackages();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error saving package');
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    try {
      await adminApi.resource('travel-deals').delete(deleteTarget._id);
      toast.success('Package deleted');
      setDeleteTarget(null);
      loadPackages();
    } catch {
      toast.error('Error deleting package');
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '1.6rem', fontWeight: 800, color: '#0f172a' }}>Holiday Packages & Travel Deals</h1>
          <p style={{ margin: '4px 0 0 0', color: '#64748b', fontSize: '0.88rem' }}>Manage international packages, Umrah tours, and destination specials.</p>
        </div>
        <button onClick={handleAddNew} style={{ padding: '10px 18px', borderRadius: '10px', background: '#0284c7', color: '#fff', border: 'none', fontWeight: 600, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
          <i className="fa-solid fa-plus"></i> Add New Package
        </button>
      </div>

      <div style={{ background: '#fff', borderRadius: '18px', padding: '24px', boxShadow: '0 4px 16px rgba(0,0,0,0.04)' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px 0' }}>
            <i className="fa-solid fa-spinner fa-spin" style={{ fontSize: '2rem', color: '#0284c7' }}></i>
            <p style={{ marginTop: '12px', color: '#64748b' }}>Loading packages...</p>
          </div>
        ) : packages.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 0', color: '#94a3b8' }}>
            <h3>No packages added yet</h3>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.88rem' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #f1f5f9', color: '#64748b', textTransform: 'uppercase', fontSize: '0.75rem' }}>
                  <th style={{ padding: '12px' }}>Package Title</th>
                  <th style={{ padding: '12px' }}>Category</th>
                  <th style={{ padding: '12px' }}>Duration</th>
                  <th style={{ padding: '12px' }}>Price</th>
                  <th style={{ padding: '12px' }}>Status</th>
                  <th style={{ padding: '12px', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {packages.map((pkg) => {
                  const priceStr = typeof pkg.price === 'object' ? `${pkg.price.currency} ${pkg.price.amount}` : pkg.price;
                  const img = pkg.image || (pkg.images && pkg.images[0]) || '/assets/cards/card3.jpg';

                  return (
                    <tr key={pkg._id} style={{ borderBottom: '1px solid #f8fafc' }}>
                      <td style={{ padding: '14px 12px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <img src={img} alt="" style={{ width: '48px', height: '48px', borderRadius: '8px', objectFit: 'cover' }} onError={(e) => { e.target.src = '/assets/cards/card3.jpg'; }} />
                          <div>
                            <div style={{ fontWeight: 700, color: '#0f172a' }}>{pkg.title}</div>
                            <div style={{ fontSize: '0.78rem', color: '#64748b' }}>{pkg.location || 'Destination'}</div>
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: '14px 12px', textTransform: 'capitalize' }}>{pkg.category || 'Tours'}</td>
                      <td style={{ padding: '14px 12px', color: '#475569' }}>{typeof pkg.duration === 'string' ? pkg.duration : '5 Days'}</td>
                      <td style={{ padding: '14px 12px', fontWeight: 700, color: '#0284c7' }}>{priceStr}</td>
                      <td style={{ padding: '14px 12px' }}>
                        <span style={{ padding: '4px 8px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 600, background: pkg.isActive !== false ? '#dcfce7' : '#fee2e2', color: pkg.isActive !== false ? '#15803d' : '#b91c1c' }}>
                          {pkg.isActive !== false ? 'Active' : 'Draft'}
                        </span>
                      </td>
                      <td style={{ padding: '14px 12px', textAlign: 'right' }}>
                        <button onClick={() => handleEdit(pkg)} style={{ padding: '6px 12px', borderRadius: '6px', background: '#f1f5f9', border: 'none', cursor: 'pointer', marginRight: '6px' }}>
                          Edit
                        </button>
                        <button onClick={() => setDeleteTarget(pkg)} style={{ padding: '6px 12px', borderRadius: '6px', background: '#fee2e2', color: '#dc2626', border: 'none', cursor: 'pointer' }}>
                          Delete
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

      {editingPkg && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(11,25,44,0.7)', zIndex: 99999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }} onClick={() => setEditingPkg(null)}>
          <div style={{ background: '#fff', borderRadius: '20px', maxWidth: '650px', width: '100%', padding: '28px', maxHeight: '85vh', overflowY: 'auto' }} onClick={(e) => e.stopPropagation()}>
            <h3 style={{ margin: '0 0 20px 0', fontSize: '1.3rem' }}>{editingPkg.isNew ? 'Create Travel Package' : 'Edit Travel Package'}</h3>
            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: '6px' }}>Package Title *</label>
                <input type="text" required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1' }} />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px', marginBottom: '14px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: '6px' }}>Category</label>
                  <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#fff' }}>
                    <option value="tours">Tours</option>
                    <option value="holiday">Holiday</option>
                    <option value="umrah">Umrah</option>
                    <option value="flights">Flights</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: '6px' }}>Price *</label>
                  <input type="text" required value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} placeholder="$299" style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: '6px' }}>Duration</label>
                  <input type="text" value={form.duration} onChange={(e) => setForm({ ...form, duration: e.target.value })} placeholder="5 Days / 4 Nights" style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1' }} />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '14px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: '6px' }}>Destination / Location</label>
                  <input type="text" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} placeholder="Dubai, UAE" style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: '6px' }}>Badge (Optional)</label>
                  <input type="text" value={form.badge} onChange={(e) => setForm({ ...form, badge: e.target.value })} placeholder="Popular / Best Seller" style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1' }} />
                </div>
              </div>

              <ImageUploadField label="Package Image" value={form.image} onChange={(val) => setForm({ ...form, image: val })} folder="airdream/packages" />

              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: '6px' }}>Description</label>
                <textarea rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1' }} />
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
                <input type="checkbox" id="pkgActive" checked={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} />
                <label htmlFor="pkgActive" style={{ fontSize: '0.88rem', fontWeight: 600 }}>Active (Visible on Website)</label>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button type="button" onClick={() => setEditingPkg(null)} style={{ padding: '8px 16px', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#fff', cursor: 'pointer' }}>Cancel</button>
                <button type="submit" style={{ padding: '8px 20px', borderRadius: '8px', background: '#0284c7', color: '#fff', border: 'none', fontWeight: 600, cursor: 'pointer' }}>Save Package</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ConfirmModal isOpen={!!deleteTarget} title="Delete Package" message={`Are you sure you want to delete "${deleteTarget?.title}"?`} onConfirm={handleDeleteConfirm} onCancel={() => setDeleteTarget(null)} />
    </div>
  );
}
