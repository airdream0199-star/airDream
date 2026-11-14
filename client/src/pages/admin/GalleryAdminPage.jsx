import React, { useState, useEffect } from 'react';
import adminApi from '../../services/adminApi';
import ConfirmModal from '../../components/admin/ConfirmModal';
import ImageUploadField from '../../components/admin/ImageUploadField';
import toast from 'react-hot-toast';

export default function GalleryAdminPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingItem, setEditingItem] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const [form, setForm] = useState({
    title: '',
    image: '',
    category: 'general',
    isActive: true,
  });

  const loadGallery = async () => {
    try {
      setLoading(true);
      const data = await adminApi.resource('gallery').list();
      setItems(data || []);
    } catch {
      toast.error('Failed to load gallery items');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadGallery();
  }, []);

  const handleEdit = (item) => {
    setEditingItem(item);
    setForm({
      title: item.title || '',
      image: item.image || '',
      category: item.category || 'general',
      isActive: item.isActive !== false,
    });
  };

  const handleAddNew = () => {
    setEditingItem({ isNew: true });
    setForm({
      title: '',
      image: '',
      category: 'general',
      isActive: true,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.image.trim()) {
      toast.error('Image URL is required');
      return;
    }

    try {
      if (editingItem.isNew) {
        await adminApi.resource('gallery').create(form);
        toast.success('Gallery photo added');
      } else {
        await adminApi.resource('gallery').update(editingItem._id, form);
        toast.success('Gallery photo updated');
      }
      setEditingItem(null);
      loadGallery();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error saving photo');
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    try {
      await adminApi.resource('gallery').delete(deleteTarget._id);
      toast.success('Photo removed');
      setDeleteTarget(null);
      loadGallery();
    } catch {
      toast.error('Error deleting photo');
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '1.6rem', fontWeight: 800, color: '#0f172a' }}>Photo Gallery</h1>
          <p style={{ margin: '4px 0 0 0', color: '#64748b', fontSize: '0.88rem' }}>Manage high-resolution travel showcase images.</p>
        </div>
        <button onClick={handleAddNew} style={{ padding: '10px 18px', borderRadius: '10px', background: '#0284c7', color: '#fff', border: 'none', fontWeight: 600, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
          <i className="fa-solid fa-plus"></i> Add Photo
        </button>
      </div>

      <div style={{ background: '#fff', borderRadius: '18px', padding: '24px', boxShadow: '0 4px 16px rgba(0,0,0,0.04)' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px 0' }}>
            <i className="fa-solid fa-spinner fa-spin" style={{ fontSize: '2rem', color: '#0284c7' }}></i>
            <p style={{ marginTop: '12px', color: '#64748b' }}>Loading gallery photos...</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '20px' }}>
            {items.map((item) => (
              <div key={item._id} style={{ background: '#f8fafc', borderRadius: '12px', overflow: 'hidden', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column' }}>
                <img src={item.image} alt="" style={{ width: '100%', height: '140px', objectFit: 'cover' }} onError={(e) => { e.target.src = '/assets/cards/card1.png'; }} />
                <div style={{ padding: '12px', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <div style={{ fontWeight: 600, color: '#0f172a', fontSize: '0.9rem', marginBottom: '8px' }}>{item.title || 'Untitled Photo'}</div>
                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '6px' }}>
                    <button onClick={() => handleEdit(item)} style={{ padding: '4px 10px', borderRadius: '6px', background: '#e2e8f0', border: 'none', cursor: 'pointer', fontSize: '0.78rem' }}>Edit</button>
                    <button onClick={() => setDeleteTarget(item)} style={{ padding: '4px 10px', borderRadius: '6px', background: '#fee2e2', color: '#dc2626', border: 'none', cursor: 'pointer', fontSize: '0.78rem' }}>Delete</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {editingItem && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(11,25,44,0.7)', zIndex: 99999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }} onClick={() => setEditingItem(null)}>
          <div style={{ background: '#fff', borderRadius: '20px', maxWidth: '500px', width: '100%', padding: '28px' }} onClick={(e) => e.stopPropagation()}>
            <h3 style={{ margin: '0 0 20px 0', fontSize: '1.3rem' }}>{editingItem.isNew ? 'Add Gallery Photo' : 'Edit Photo'}</h3>
            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: '6px' }}>Photo Caption</label>
                <input type="text" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="e.g. Desert Sunset Safari" style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1' }} />
              </div>

              <ImageUploadField label="Image URL / Upload *" value={form.image} onChange={(val) => setForm({ ...form, image: val })} folder="airdream/gallery" />

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
                <input type="checkbox" id="galActive" checked={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} />
                <label htmlFor="galActive" style={{ fontSize: '0.88rem', fontWeight: 600 }}>Active (Visible in Gallery)</label>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button type="button" onClick={() => setEditingItem(null)} style={{ padding: '8px 16px', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#fff', cursor: 'pointer' }}>Cancel</button>
                <button type="submit" style={{ padding: '8px 20px', borderRadius: '8px', background: '#0284c7', color: '#fff', border: 'none', fontWeight: 600, cursor: 'pointer' }}>Save Photo</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ConfirmModal isOpen={!!deleteTarget} title="Delete Gallery Photo" message="Are you sure you want to delete this photo?" onConfirm={handleDeleteConfirm} onCancel={() => setDeleteTarget(null)} />
    </div>
  );
}
