import React, { useState, useEffect } from 'react';
import adminApi from '../../services/adminApi';
import ConfirmModal from '../../components/admin/ConfirmModal';
import ImageUploadField from '../../components/admin/ImageUploadField';
import toast from 'react-hot-toast';

export default function HeroSlidesAdminPage() {
  const [slides, setSlides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingSlide, setEditingSlide] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const [form, setForm] = useState({
    title: '',
    highlight: '',
    badge: 'Premium Flight Booking',
    badgeIcon: 'fa-plane',
    desc: '',
    image: '',
    primaryBtnText: 'Book Your Flight',
    primaryBtnLink: '#packages',
    secondaryBtnText: 'Request Custom Quote',
    secondaryBtnLink: '#contact',
    order: 0,
    isActive: true,
  });

  const loadSlides = async () => {
    try {
      setLoading(true);
      const data = await adminApi.resource('hero-slides').list();
      setSlides(data || []);
    } catch {
      toast.error('Failed to load hero slides');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSlides();
  }, []);

  const handleEdit = (slide) => {
    setEditingSlide(slide);
    setForm({
      title: slide.title || '',
      highlight: slide.highlight || '',
      badge: slide.badge || 'Premium Flight Booking',
      badgeIcon: slide.badgeIcon || 'fa-plane',
      desc: slide.desc || '',
      image: slide.image || '',
      primaryBtnText: slide.primaryBtnText || 'Book Your Flight',
      primaryBtnLink: slide.primaryBtnLink || '#packages',
      secondaryBtnText: slide.secondaryBtnText || 'Request Custom Quote',
      secondaryBtnLink: slide.secondaryBtnLink || '#contact',
      order: typeof slide.order === 'number' ? slide.order : 0,
      isActive: slide.isActive !== false,
    });
  };

  const handleAddNew = () => {
    setEditingSlide({ isNew: true });
    setForm({
      title: '',
      highlight: '',
      badge: 'Premium Flight Booking',
      badgeIcon: 'fa-plane',
      desc: '',
      image: '',
      primaryBtnText: 'Book Your Flight',
      primaryBtnLink: '#packages',
      secondaryBtnText: 'Request Custom Quote',
      secondaryBtnLink: '#contact',
      order: slides.length,
      isActive: true,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) {
      toast.error('Slide title is required');
      return;
    }

    try {
      if (editingSlide.isNew) {
        await adminApi.resource('hero-slides').create(form);
        toast.success('Hero slide created');
      } else {
        await adminApi.resource('hero-slides').update(editingSlide._id, form);
        toast.success('Hero slide updated');
      }
      setEditingSlide(null);
      await loadSlides();
      // Notify all tabs and components of updated data
      window.dispatchEvent(new CustomEvent('airdream:data_updated', { detail: { resource: 'hero-slides' } }));
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error saving slide');
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    try {
      await adminApi.resource('hero-slides').delete(deleteTarget._id);
      toast.success('Hero slide deleted');
      setDeleteTarget(null);
      await loadSlides();
      window.dispatchEvent(new CustomEvent('airdream:data_updated', { detail: { resource: 'hero-slides' } }));
    } catch {
      toast.error('Error deleting slide');
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '1.6rem', fontWeight: 800, color: '#0f172a' }}>Hero Slides &amp; Wallpapers</h1>
          <p style={{ margin: '4px 0 0 0', color: '#64748b', fontSize: '0.88rem' }}>
            Manage full-width hero wallpaper images. The homepage hero section displays pure images only (no text overlay).
          </p>
        </div>
        <button onClick={handleAddNew} style={{ padding: '10px 18px', borderRadius: '10px', background: '#0284c7', color: '#fff', border: 'none', fontWeight: 600, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
          <i className="fa-solid fa-plus"></i> Add Slide
        </button>
      </div>

      <div style={{ background: '#fff', borderRadius: '18px', padding: '24px', boxShadow: '0 4px 16px rgba(0,0,0,0.04)' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px 0' }}>
            <i className="fa-solid fa-spinner fa-spin" style={{ fontSize: '2rem', color: '#0284c7' }}></i>
            <p style={{ marginTop: '12px', color: '#64748b' }}>Loading hero slides...</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '24px' }}>
            {slides.map((s) => (
              <div key={s._id} style={{ background: '#f8fafc', borderRadius: '16px', overflow: 'hidden', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column' }}>
                <div style={{ height: '170px', position: 'relative' }}>
                  <img
                    src={s.image || '/assets/cards/card1.png'}
                    alt=""
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    onError={(e) => { e.target.src = '/assets/cards/card1.png'; }}
                  />
                  {!s.isActive && (
                    <div style={{ position: 'absolute', top: '10px', right: '10px', background: '#ef4444', color: '#fff', padding: '3px 8px', borderRadius: '6px', fontSize: '0.7rem', fontWeight: 700 }}>
                      Inactive
                    </div>
                  )}
                </div>
                <div style={{ padding: '16px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 700, color: '#0f172a' }}>
                      {s.title || 'Hero Wallpaper'}
                    </h3>
                    <span style={{ fontSize: '0.72rem', background: '#e0f2fe', color: '#0284c7', padding: '2px 8px', borderRadius: '12px', fontWeight: 600 }}>
                      Wallpaper
                    </span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto', paddingTop: '10px' }}>
                    <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Order: {s.order || 0}</span>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button onClick={() => handleEdit(s)} style={{ padding: '6px 12px', borderRadius: '6px', background: '#e2e8f0', border: 'none', cursor: 'pointer', fontSize: '0.82rem' }}>Edit</button>
                      <button onClick={() => setDeleteTarget(s)} style={{ padding: '6px 12px', borderRadius: '6px', background: '#fee2e2', color: '#dc2626', border: 'none', cursor: 'pointer', fontSize: '0.82rem' }}>Delete</button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {editingSlide && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(11,25,44,0.7)', zIndex: 99999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }} onClick={() => setEditingSlide(null)}>
          <div style={{ background: '#fff', borderRadius: '20px', maxWidth: '640px', width: '100%', padding: '28px', maxHeight: '88vh', overflowY: 'auto' }} onClick={(e) => e.stopPropagation()}>
            <h3 style={{ margin: '0 0 20px 0', fontSize: '1.3rem' }}>{editingSlide.isNew ? 'Create Hero Slide' : 'Edit Hero Slide'}</h3>
            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: '16px', background: '#f0f9ff', padding: '14px', borderRadius: '12px', border: '1px solid #bae6fd' }}>
                <p style={{ margin: 0, fontSize: '0.82rem', color: '#0369a1', fontWeight: 500 }}>
                  <i className="fa-solid fa-circle-info" style={{ marginRight: '6px' }}></i>
                  The homepage hero section displays high-resolution images only. Upload a wide landscape wallpaper (1920x1080 recommended).
                </p>
              </div>

              <ImageUploadField
                label="Slide Background Image *"
                value={form.image}
                onChange={(val) => setForm({ ...form, image: val })}
                folder="airdream/wallpapers"
              />

              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '12px', marginBottom: '14px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: '6px' }}>
                    Slide Title / Internal Label *
                  </label>
                  <input
                    type="text"
                    required
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                    placeholder="e.g. Tropical Beach Resort"
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: '6px' }}>Display Order</label>
                  <input
                    type="number"
                    value={form.order}
                    onChange={(e) => setForm({ ...form, order: Number(e.target.value) || 0 })}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
                <input
                  type="checkbox"
                  id="slideActive"
                  checked={form.isActive}
                  onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
                />
                <label htmlFor="slideActive" style={{ fontSize: '0.88rem', fontWeight: 600 }}>
                  Active (Display on Homepage Slider)
                </label>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button type="button" onClick={() => setEditingSlide(null)} style={{ padding: '8px 16px', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#fff', cursor: 'pointer' }}>Cancel</button>
                <button type="submit" style={{ padding: '8px 20px', borderRadius: '8px', background: '#0284c7', color: '#fff', border: 'none', fontWeight: 600, cursor: 'pointer' }}>Save Slide</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ConfirmModal isOpen={!!deleteTarget} title="Delete Hero Slide" message={`Are you sure you want to delete "${deleteTarget?.title}"?`} onConfirm={handleDeleteConfirm} onCancel={() => setDeleteTarget(null)} />
    </div>
  );
}
