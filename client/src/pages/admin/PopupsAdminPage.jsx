import React, { useState, useEffect } from 'react';
import adminApi from '../../services/adminApi';
import ConfirmModal from '../../components/admin/ConfirmModal';
import ImageUploadField from '../../components/admin/ImageUploadField';
import toast from 'react-hot-toast';

export default function PopupsAdminPage() {
  const [popups, setPopups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingPopup, setEditingPopup] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const [form, setForm] = useState({
    title: '',
    message: '',
    imageUrl: '',
    buttonText: 'Claim Deal',
    buttonLink: '#packages',
    isActive: true,
  });

  const loadPopups = async () => {
    try {
      setLoading(true);
      const data = await adminApi.resource('popups').list();
      setPopups(data || []);
    } catch {
      toast.error('Failed to load promotions');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPopups();
  }, []);

  const handleEdit = (p) => {
    setEditingPopup(p);
    setForm({
      title: p.title || '',
      message: p.message || '',
      imageUrl: p.imageUrl || '',
      buttonText: p.buttonText || 'Claim Deal',
      buttonLink: p.buttonLink || '#packages',
      isActive: p.isActive !== false,
    });
  };

  const handleAddNew = () => {
    setEditingPopup({ isNew: true });
    setForm({
      title: '',
      message: '',
      imageUrl: '',
      buttonText: 'Claim Deal',
      buttonLink: '#packages',
      isActive: true,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) {
      toast.error('Promotion title is required');
      return;
    }

    try {
      if (editingPopup.isNew) {
        await adminApi.resource('popups').create(form);
        toast.success('Promotion popup created');
      } else {
        await adminApi.resource('popups').update(editingPopup._id, form);
        toast.success('Promotion popup updated');
      }
      setEditingPopup(null);
      loadPopups();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error saving promotion');
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    try {
      await adminApi.resource('popups').delete(deleteTarget._id);
      toast.success('Promotion popup deleted');
      setDeleteTarget(null);
      loadPopups();
    } catch {
      toast.error('Error deleting promotion');
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '1.6rem', fontWeight: 800, color: '#0f172a' }}>Promotional Popups & Banners</h1>
          <p style={{ margin: '4px 0 0 0', color: '#64748b', fontSize: '0.88rem' }}>Manage modal promotional offers shown to website visitors.</p>
        </div>
        <button onClick={handleAddNew} style={{ padding: '10px 18px', borderRadius: '10px', background: '#0284c7', color: '#fff', border: 'none', fontWeight: 600, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
          <i className="fa-solid fa-plus"></i> Add Promotion
        </button>
      </div>

      <div style={{ background: '#fff', borderRadius: '18px', padding: '24px', boxShadow: '0 4px 16px rgba(0,0,0,0.04)' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px 0' }}>
            <i className="fa-solid fa-spinner fa-spin" style={{ fontSize: '2rem', color: '#0284c7' }}></i>
            <p style={{ marginTop: '12px', color: '#64748b' }}>Loading promotions...</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
            {popups.map((p) => (
              <div key={p._id} style={{ background: '#f8fafc', borderRadius: '14px', border: '1px solid #e2e8f0', padding: '18px', display: 'flex', flexDirection: 'column' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                  <h3 style={{ margin: 0, fontSize: '1.1rem', color: '#0f172a' }}>{p.title}</h3>
                  <span style={{ padding: '3px 8px', borderRadius: '10px', fontSize: '0.72rem', fontWeight: 600, background: p.isActive ? '#dcfce7' : '#fee2e2', color: p.isActive ? '#15803d' : '#b91c1c' }}>
                    {p.isActive ? 'Active' : 'Disabled'}
                  </span>
                </div>
                <p style={{ color: '#64748b', fontSize: '0.85rem', flex: 1, margin: '0 0 14px 0' }}>{p.message}</p>
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '6px' }}>
                  <button onClick={() => handleEdit(p)} style={{ padding: '6px 12px', borderRadius: '6px', background: '#e2e8f0', border: 'none', cursor: 'pointer', fontSize: '0.82rem' }}>Edit</button>
                  <button onClick={() => setDeleteTarget(p)} style={{ padding: '6px 12px', borderRadius: '6px', background: '#fee2e2', color: '#dc2626', border: 'none', cursor: 'pointer', fontSize: '0.82rem' }}>Delete</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {editingPopup && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(11,25,44,0.7)', zIndex: 99999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }} onClick={() => setEditingPopup(null)}>
          <div style={{ background: '#fff', borderRadius: '20px', maxWidth: '550px', width: '100%', padding: '28px' }} onClick={(e) => e.stopPropagation()}>
            <h3 style={{ margin: '0 0 20px 0', fontSize: '1.3rem' }}>{editingPopup.isNew ? 'New Promotion' : 'Edit Promotion'}</h3>
            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: '6px' }}>Promotion Title *</label>
                <input type="text" required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1' }} />
              </div>

              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: '6px' }}>Offer Message</label>
                <textarea rows={3} value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1' }} />
              </div>

              <ImageUploadField label="Banner Image (Optional)" value={form.imageUrl} onChange={(val) => setForm({ ...form, imageUrl: val })} folder="airdream/popups" />

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '14px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: '6px' }}>Button Text</label>
                  <input type="text" value={form.buttonText} onChange={(e) => setForm({ ...form, buttonText: e.target.value })} style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: '6px' }}>Button Target URL</label>
                  <input type="text" value={form.buttonLink} onChange={(e) => setForm({ ...form, buttonLink: e.target.value })} style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1' }} />
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
                <input type="checkbox" id="popActive" checked={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} />
                <label htmlFor="popActive" style={{ fontSize: '0.88rem', fontWeight: 600 }}>Active (Show to Website Visitors)</label>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button type="button" onClick={() => setEditingPopup(null)} style={{ padding: '8px 16px', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#fff', cursor: 'pointer' }}>Cancel</button>
                <button type="submit" style={{ padding: '8px 20px', borderRadius: '8px', background: '#0284c7', color: '#fff', border: 'none', fontWeight: 600, cursor: 'pointer' }}>Save Promotion</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ConfirmModal isOpen={!!deleteTarget} title="Delete Promotion" message={`Are you sure you want to delete "${deleteTarget?.title}"?`} onConfirm={handleDeleteConfirm} onCancel={() => setDeleteTarget(null)} />
    </div>
  );
}
