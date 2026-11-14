import React, { useState, useEffect } from 'react';
import adminApi from '../../services/adminApi';
import ConfirmModal from '../../components/admin/ConfirmModal';
import ImageUploadField from '../../components/admin/ImageUploadField';
import toast from 'react-hot-toast';

export default function FeatureCardsAdminPage() {
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingCard, setEditingCard] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const [form, setForm] = useState({
    title: '',
    icon: '✈️',
    price: 'From $299',
    desc: '',
    image: '',
    badge: '',
    isActive: true,
  });

  const loadCards = async () => {
    try {
      setLoading(true);
      const data = await adminApi.resource('feature-cards').list();
      setCards(data || []);
    } catch {
      toast.error('Failed to load feature cards');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCards();
  }, []);

  const handleEdit = (card) => {
    setEditingCard(card);
    setForm({
      title: card.title || '',
      icon: card.icon || '✈️',
      price: card.price || '',
      desc: card.desc || card.description || '',
      image: card.image || '',
      badge: card.badge || '',
      isActive: card.isActive !== false,
    });
  };

  const handleAddNew = () => {
    setEditingCard({ isNew: true });
    setForm({
      title: '',
      icon: '✈️',
      price: 'From $299',
      desc: '',
      image: '',
      badge: '',
      isActive: true,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) {
      toast.error('Card title is required');
      return;
    }

    const payload = {
      ...form,
      description: form.desc,
    };

    try {
      if (editingCard.isNew) {
        await adminApi.resource('feature-cards').create(payload);
        toast.success('Feature card created');
      } else {
        await adminApi.resource('feature-cards').update(editingCard._id, payload);
        toast.success('Feature card updated');
      }
      setEditingCard(null);
      loadCards();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error saving feature card');
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    try {
      await adminApi.resource('feature-cards').delete(deleteTarget._id);
      toast.success('Feature card deleted');
      setDeleteTarget(null);
      loadCards();
    } catch {
      toast.error('Error deleting card');
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '1.6rem', fontWeight: 800, color: '#0f172a' }}>Why Choose Us Cards</h1>
          <p style={{ margin: '4px 0 0 0', color: '#64748b', fontSize: '0.88rem' }}>Manage the 6 interactive 3D flip cards on the homepage.</p>
        </div>
        <button onClick={handleAddNew} style={{ padding: '10px 18px', borderRadius: '10px', background: '#0284c7', color: '#fff', border: 'none', fontWeight: 600, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
          <i className="fa-solid fa-plus"></i> Add Card
        </button>
      </div>

      <div style={{ background: '#fff', borderRadius: '18px', padding: '24px', boxShadow: '0 4px 16px rgba(0,0,0,0.04)' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px 0' }}>
            <i className="fa-solid fa-spinner fa-spin" style={{ fontSize: '2rem', color: '#0284c7' }}></i>
            <p style={{ marginTop: '12px', color: '#64748b' }}>Loading feature cards...</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
            {cards.map((c) => (
              <div key={c._id} style={{ background: '#f8fafc', borderRadius: '14px', border: '1px solid #e2e8f0', padding: '18px', display: 'flex', flexDirection: 'column' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                  <span style={{ fontSize: '1.5rem' }}>{c.icon || '✈️'}</span>
                  <div>
                    <h3 style={{ margin: 0, fontSize: '1.1rem', color: '#0f172a' }}>{c.title}</h3>
                    <span style={{ fontSize: '0.8rem', color: '#0284c7', fontWeight: 600 }}>{c.price}</span>
                  </div>
                </div>
                <p style={{ margin: '0 0 16px 0', color: '#64748b', fontSize: '0.85rem', flex: 1, lineHeight: 1.5 }}>
                  {c.desc || c.description}
                </p>
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '6px' }}>
                  <button onClick={() => handleEdit(c)} style={{ padding: '6px 12px', borderRadius: '6px', background: '#e2e8f0', border: 'none', cursor: 'pointer', fontSize: '0.82rem' }}>Edit</button>
                  <button onClick={() => setDeleteTarget(c)} style={{ padding: '6px 12px', borderRadius: '6px', background: '#fee2e2', color: '#dc2626', border: 'none', cursor: 'pointer', fontSize: '0.82rem' }}>Delete</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {editingCard && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(11,25,44,0.7)', zIndex: 99999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }} onClick={() => setEditingCard(null)}>
          <div style={{ background: '#fff', borderRadius: '20px', maxWidth: '550px', width: '100%', padding: '28px', maxHeight: '85vh', overflowY: 'auto' }} onClick={(e) => e.stopPropagation()}>
            <h3 style={{ margin: '0 0 20px 0', fontSize: '1.3rem' }}>{editingCard.isNew ? 'Create Feature Card' : 'Edit Feature Card'}</h3>
            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: '6px' }}>Card Title *</label>
                <input type="text" required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1' }} />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '14px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: '6px' }}>Icon (Emoji)</label>
                  <input type="text" value={form.icon} onChange={(e) => setForm({ ...form, icon: e.target.value })} style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: '6px' }}>Price Tag</label>
                  <input type="text" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} placeholder="From $299" style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1' }} />
                </div>
              </div>

              <ImageUploadField label="Card Image" value={form.image} onChange={(val) => setForm({ ...form, image: val })} folder="airdream/cards" />

              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: '6px' }}>Description</label>
                <textarea rows={3} value={form.desc} onChange={(e) => setForm({ ...form, desc: e.target.value })} style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1' }} />
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
                <input type="checkbox" id="cardActive" checked={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} />
                <label htmlFor="cardActive" style={{ fontSize: '0.88rem', fontWeight: 600 }}>Active (Visible on Homepage)</label>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button type="button" onClick={() => setEditingCard(null)} style={{ padding: '8px 16px', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#fff', cursor: 'pointer' }}>Cancel</button>
                <button type="submit" style={{ padding: '8px 20px', borderRadius: '8px', background: '#0284c7', color: '#fff', border: 'none', fontWeight: 600, cursor: 'pointer' }}>Save Card</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ConfirmModal isOpen={!!deleteTarget} title="Delete Feature Card" message={`Are you sure you want to delete "${deleteTarget?.title}"?`} onConfirm={handleDeleteConfirm} onCancel={() => setDeleteTarget(null)} />
    </div>
  );
}
