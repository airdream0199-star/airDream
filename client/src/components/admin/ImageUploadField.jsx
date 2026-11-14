import React, { useState } from 'react';
import adminApi from '../../services/adminApi';
import toast from 'react-hot-toast';

export default function ImageUploadField({ label = 'Image URL / Upload', value, onChange, folder = 'airdream' }) {
  const [uploading, setUploading] = useState(false);

  const handleFileSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file (JPG, PNG, WEBP, SVG)');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast.error('Image size must be less than 10MB');
      return;
    }

    const formData = new FormData();
    formData.append('image', file);
    formData.append('folder', folder);

    setUploading(true);
    try {
      const res = await adminApi.uploadImage(formData);
      if (res && res.url) {
        onChange(res.url);
        toast.success('Image uploaded to Cloudinary!');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error uploading image');
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  return (
    <div style={{ marginBottom: '16px' }}>
      <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
        {label}
      </label>

      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
        <input
          type="text"
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          placeholder="https://... or click Upload"
          style={{
            flex: 1,
            padding: '9px 12px',
            borderRadius: '8px',
            border: '1px solid #cbd5e1',
            fontSize: '0.88rem',
            background: '#fff',
          }}
        />

        <label
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            padding: '9px 14px',
            borderRadius: '8px',
            background: '#0284c7',
            color: '#fff',
            fontSize: '0.82rem',
            fontWeight: 600,
            cursor: uploading ? 'not-allowed' : 'pointer',
            opacity: uploading ? 0.75 : 1,
            whiteSpace: 'nowrap',
          }}
        >
          <i className={`fa-solid ${uploading ? 'fa-spinner fa-spin' : 'fa-cloud-arrow-up'}`}></i>
          <span>{uploading ? 'Uploading...' : 'Upload Image'}</span>
          <input
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            disabled={uploading}
            style={{ display: 'none' }}
          />
        </label>
      </div>

      {value && (
        <div style={{ marginTop: '8px', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <img
            src={value}
            alt="Preview"
            style={{ width: '48px', height: '48px', borderRadius: '6px', objectFit: 'cover', border: '1px solid #e2e8f0' }}
            onError={(e) => { e.target.style.display = 'none'; }}
          />
          <button
            type="button"
            onClick={() => onChange('')}
            style={{ background: 'none', border: 'none', color: '#dc2626', fontSize: '0.78rem', cursor: 'pointer', padding: 0 }}
          >
            <i className="fa-solid fa-trash" style={{ marginRight: '4px' }}></i> Remove
          </button>
        </div>
      )}
    </div>
  );
}
