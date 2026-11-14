import React, { useState, useEffect } from 'react';
import adminApi from '../../services/adminApi';
import ImageUploadField from '../../components/admin/ImageUploadField';
import toast from 'react-hot-toast';

export default function SettingsAdminPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    brandName: '',
    brandTagline: '',
    logoUrl: '',
    phone: '',
    whatsapp: '',
    email: '',
    address: '',
    aboutQuote: '',
    aboutArchImg: '',
    bubble1Img: '',
    bubble2Img: '',
    bubble3Img: '',
  });

  const loadSettings = async () => {
    try {
      setLoading(true);
      const data = await adminApi.getSettings();
      if (data) {
        setForm({
          brandName: data.brandName || '',
          brandTagline: data.brandTagline || '',
          logoUrl: data.logoUrl || '',
          phone: data.phone || '',
          whatsapp: data.whatsapp || '',
          email: data.email || '',
          address: data.address || '',
          aboutQuote: data.aboutQuote || '',
          aboutArchImg: data.aboutArchImg || '',
          bubble1Img: data.bubble1Img || '',
          bubble2Img: data.bubble2Img || '',
          bubble3Img: data.bubble3Img || '',
        });
      }
    } catch {
      toast.error('Failed to load site settings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSettings();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await adminApi.updateSettings(form);
      toast.success('Website settings updated successfully');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error updating settings');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '60px 0' }}>
        <i className="fa-solid fa-spinner fa-spin" style={{ fontSize: '2rem', color: '#0284c7' }}></i>
        <p style={{ marginTop: '12px', color: '#64748b' }}>Loading settings...</p>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '900px' }}>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ margin: 0, fontSize: '1.6rem', fontWeight: 800, color: '#0f172a' }}>Global Website Settings</h1>
        <p style={{ margin: '4px 0 0 0', color: '#64748b', fontSize: '0.88rem' }}>Manage branding, office address, contact channels, and visual assets.</p>
      </div>

      <form onSubmit={handleSubmit} style={{ background: '#fff', borderRadius: '18px', padding: '32px', boxShadow: '0 4px 16px rgba(0,0,0,0.04)' }}>
        <h3 style={{ margin: '0 0 16px 0', fontSize: '1.15rem', color: '#0f172a', borderBottom: '1px solid #f1f5f9', paddingBottom: '10px' }}>
          Brand Identity
        </h3>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>Brand Name</label>
            <input type="text" value={form.brandName} onChange={(e) => setForm({ ...form, brandName: e.target.value })} style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1' }} />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>Brand Tagline</label>
            <input type="text" value={form.brandTagline} onChange={(e) => setForm({ ...form, brandTagline: e.target.value })} style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1' }} />
          </div>
        </div>

        <ImageUploadField label="Brand Logo Image" value={form.logoUrl} onChange={(val) => setForm({ ...form, logoUrl: val })} folder="airdream/branding" />

        <h3 style={{ margin: '28px 0 16px 0', fontSize: '1.15rem', color: '#0f172a', borderBottom: '1px solid #f1f5f9', paddingBottom: '10px' }}>
          Contact & Location Details
        </h3>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>Phone Hotline</label>
            <input type="text" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1' }} />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>WhatsApp Number (Digits only)</label>
            <input type="text" value={form.whatsapp} onChange={(e) => setForm({ ...form, whatsapp: e.target.value })} style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1' }} />
          </div>
        </div>

        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>Official Email Address</label>
          <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1' }} />
        </div>

        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>Physical Office Address</label>
          <input type="text" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1' }} />
        </div>

        <h3 style={{ margin: '28px 0 16px 0', fontSize: '1.15rem', color: '#0f172a', borderBottom: '1px solid #f1f5f9', paddingBottom: '10px' }}>
          About Us Section Composition
        </h3>

        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>About Us Mission Quote</label>
          <textarea rows={3} value={form.aboutQuote} onChange={(e) => setForm({ ...form, aboutQuote: e.target.value })} style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1' }} />
        </div>

        <ImageUploadField label="Main Arch Picture" value={form.aboutArchImg} onChange={(val) => setForm({ ...form, aboutArchImg: val })} folder="airdream/about" />

        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '28px' }}>
          <button
            type="submit"
            disabled={saving}
            style={{
              padding: '12px 28px',
              borderRadius: '10px',
              background: '#0284c7',
              color: '#fff',
              border: 'none',
              fontWeight: 700,
              fontSize: '0.95rem',
              cursor: saving ? 'not-allowed' : 'pointer',
              opacity: saving ? 0.75 : 1,
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            {saving ? <i className="fa-solid fa-spinner fa-spin"></i> : <i className="fa-solid fa-check"></i>}
            <span>{saving ? 'Saving Settings...' : 'Save All Settings'}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
