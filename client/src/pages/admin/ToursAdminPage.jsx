import React, { useState, useEffect, useMemo } from 'react';
import adminApi from '../../services/adminApi';
import ConfirmModal from '../../components/admin/ConfirmModal';
import ImageUploadField from '../../components/admin/ImageUploadField';
import toast from 'react-hot-toast';

export const TOUR_SECTIONS = [
  { id: 'dubai', title: 'Top Places to Visit in Dubai', short: 'Dubai', icon: 'fa-city', color: '#0284c7', bg: '#e0f2fe' },
  { id: 'abu-dhabi', title: 'Abu Dhabi Awaits You', short: 'Abu Dhabi', icon: 'fa-mosque', color: '#7c3aed', bg: '#ede9fe' },
  { id: 'baku', title: 'Explore Beautiful Baku', short: 'Baku', icon: 'fa-mountain-sun', color: '#059669', bg: '#d1fae5' },
  { id: 'umrah', title: 'Your Perfect Umrah Journey', short: 'Umrah', icon: 'fa-kaaba', color: '#d97706', bg: '#fef3c7' },
  { id: 'visa-tickets', title: 'Visit Visa and Tickets', short: 'Visas & Tickets', icon: 'fa-passport', color: '#db2777', bg: '#fce7f3' },
  { id: 'world-tours', title: 'World Best Places Tours', short: 'World Tours', icon: 'fa-earth-americas', color: '#2563eb', bg: '#dbeafe' },
];

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

  // Section & Search Filters
  const [selectedSection, setSelectedSection] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  const [form, setForm] = useState({
    title: '',
    section: 'dubai',
    category: 'Sightseeing',
    price: '',
    currency: 'AED',
    duration: '08-Hrs',
    location: 'Dubai, UAE',
    vehicle: '4WD Cruiser',
    capacity: '4 Persons',
    guide: 'Driver-guide',
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

  // Calculate counts per section
  const sectionCounts = useMemo(() => {
    const counts = { all: tours.length };
    TOUR_SECTIONS.forEach((s) => {
      counts[s.id] = tours.filter((t) => {
        const sec = (t.section || '').toLowerCase();
        if (sec === s.id) return true;
        if (!sec) {
          // keyword fallback count
          const text = `${t.title || ''} ${t.location || ''} ${t.category || ''}`.toLowerCase();
          if (s.id === 'dubai') return text.includes('dubai') || text.includes('desert') || text.includes('burj');
          if (s.id === 'abu-dhabi') return text.includes('abu dhabi') || text.includes('yas');
          if (s.id === 'baku') return text.includes('baku') || text.includes('azerbaijan');
          if (s.id === 'umrah') return text.includes('umrah') || text.includes('makkah');
          if (s.id === 'visa-tickets') return text.includes('visa') || text.includes('ticket');
          if (s.id === 'world-tours') return text.includes('maldives') || text.includes('swiss') || text.includes('world');
        }
        return false;
      }).length;
    });
    return counts;
  }, [tours]);

  // Filtered tours for table display
  const filteredTours = useMemo(() => {
    return tours.filter((t) => {
      // Section match
      let matchSec = true;
      if (selectedSection !== 'all') {
        const sec = (t.section || '').toLowerCase();
        if (sec) {
          matchSec = sec === selectedSection;
        } else {
          const text = `${t.title || ''} ${t.location || ''} ${t.category || ''}`.toLowerCase();
          if (selectedSection === 'dubai') matchSec = text.includes('dubai') || text.includes('desert') || text.includes('burj');
          else if (selectedSection === 'abu-dhabi') matchSec = text.includes('abu dhabi') || text.includes('yas');
          else if (selectedSection === 'baku') matchSec = text.includes('baku') || text.includes('azerbaijan');
          else if (selectedSection === 'umrah') matchSec = text.includes('umrah') || text.includes('makkah');
          else if (selectedSection === 'visa-tickets') matchSec = text.includes('visa') || text.includes('ticket');
          else if (selectedSection === 'world-tours') matchSec = text.includes('maldives') || text.includes('swiss') || text.includes('world');
          else matchSec = false;
        }
      }

      // Search match
      let matchSearch = true;
      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase();
        matchSearch =
          (t.title || '').toLowerCase().includes(q) ||
          (t.location || '').toLowerCase().includes(q) ||
          (t.category || '').toLowerCase().includes(q) ||
          (t.section || '').toLowerCase().includes(q);
      }

      return matchSec && matchSearch;
    });
  }, [tours, selectedSection, searchTerm]);

  const handleEdit = (tour) => {
    setEditingTour(tour);
    setForm({
      title: tour.title || '',
      section: tour.section || 'dubai',
      category: tour.category || 'Sightseeing',
      price: typeof tour.price === 'object' ? tour.price.amount : tour.price || '',
      currency: typeof tour.price === 'object' ? tour.price.currency : tour.currency || 'AED',
      duration: formatDurationString(tour.duration || tour.hours),
      location: tour.location || 'Dubai, UAE',
      vehicle: tour.vehicle || tour.carHours || '4WD Cruiser',
      capacity: tour.capacity || '4 Persons',
      guide: tour.guide || 'Driver-guide',
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
      section: selectedSection !== 'all' ? selectedSection : 'dubai',
      category: 'Sightseeing',
      price: '',
      currency: 'AED',
      duration: '08-Hrs',
      location: selectedSection === 'abu-dhabi' ? 'Abu Dhabi, UAE' : selectedSection === 'baku' ? 'Baku, Azerbaijan' : selectedSection === 'umrah' ? 'Makkah & Madinah, KSA' : 'Dubai, UAE',
      vehicle: '4WD Cruiser',
      capacity: '4 Persons',
      guide: 'Driver-guide',
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
      section: form.section.trim(),
      category: form.category.trim(),
      price: Number(form.price) || form.price,
      currency: form.currency.trim(),
      duration: form.duration.trim(),
      location: form.location.trim(),
      vehicle: form.vehicle.trim(),
      capacity: form.capacity.trim(),
      guide: form.guide.trim(),
      rating: Number(form.rating) || 4.8,
      images: form.image ? [form.image] : [],
      description: form.description.trim(),
      highlights: form.highlights.split('\n').map((h) => h.trim()).filter(Boolean),
      isActive: form.isActive,
    };

    try {
      if (editingTour.isNew) {
        await adminApi.resource('tours').create(payload);
        toast.success('Tour created successfully in ' + (TOUR_SECTIONS.find((s) => s.id === form.section)?.short || form.section));
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
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '1.6rem', fontWeight: 800, color: '#0f172a' }}>Tours &amp; Excursions</h1>
          <p style={{ margin: '4px 0 0 0', color: '#64748b', fontSize: '0.88rem' }}>
            Manage the 6 homepage tour sliders: Dubai, Abu Dhabi, Baku, Umrah, Visas &amp; Tickets, and World Tours.
          </p>
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
            boxShadow: '0 4px 12px rgba(2, 132, 199, 0.25)',
          }}
        >
          <i className="fa-solid fa-plus"></i> Add New Tour
        </button>
      </div>

      {/* Section Filter Tabs */}
      <div
        style={{
          display: 'flex',
          gap: '8px',
          overflowX: 'auto',
          paddingBottom: '8px',
          marginBottom: '20px',
        }}
      >
        <button
          type="button"
          onClick={() => setSelectedSection('all')}
          style={{
            padding: '8px 16px',
            borderRadius: '12px',
            border: 'none',
            background: selectedSection === 'all' ? '#0f172a' : '#ffffff',
            color: selectedSection === 'all' ? '#ffffff' : '#475569',
            fontWeight: 600,
            fontSize: '0.84rem',
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            whiteSpace: 'nowrap',
            boxShadow: '0 2px 6px rgba(0,0,0,0.04)',
            transition: 'all 0.2s ease',
          }}
        >
          <i className="fa-solid fa-layer-group"></i> All Sections ({sectionCounts.all || 0})
        </button>

        {TOUR_SECTIONS.map((sec, idx) => {
          const isActive = selectedSection === sec.id;
          const count = sectionCounts[sec.id] || 0;
          return (
            <button
              key={sec.id}
              type="button"
              onClick={() => setSelectedSection(sec.id)}
              style={{
                padding: '8px 16px',
                borderRadius: '12px',
                border: isActive ? `2px solid ${sec.color}` : '1px solid #e2e8f0',
                background: isActive ? sec.bg : '#ffffff',
                color: isActive ? sec.color : '#475569',
                fontWeight: 600,
                fontSize: '0.84rem',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                whiteSpace: 'nowrap',
                boxShadow: '0 2px 6px rgba(0,0,0,0.04)',
                transition: 'all 0.2s ease',
              }}
            >
              <i className={`fa-solid ${sec.icon}`} style={{ color: sec.color }}></i>
              <span>{idx + 1}. {sec.short} ({count})</span>
            </button>
          );
        })}
      </div>

      {/* Main Content Card */}
      <div style={{ background: '#fff', borderRadius: '18px', padding: '24px', boxShadow: '0 4px 16px rgba(0,0,0,0.04)' }}>
        {/* Controls: Search and Info */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '14px',
            marginBottom: '20px',
            paddingBottom: '16px',
            borderBottom: '1px solid #f1f5f9',
          }}
        >
          <div style={{ position: 'relative', width: '320px', maxWidth: '100%' }}>
            <i
              className="fa-solid fa-magnifying-glass"
              style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }}
            ></i>
            <input
              type="text"
              placeholder="Search tours by name, location, or tag..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: '100%',
                padding: '9px 12px 9px 36px',
                borderRadius: '10px',
                border: '1px solid #cbd5e1',
                fontSize: '0.85rem',
                outline: 'none',
              }}
            />
          </div>

          <div style={{ fontSize: '0.85rem', color: '#64748b' }}>
            Showing <strong>{filteredTours.length}</strong> of <strong>{tours.length}</strong> tours
            {selectedSection !== 'all' && (
              <span style={{ marginLeft: '6px' }}>
                in <strong>{TOUR_SECTIONS.find((s) => s.id === selectedSection)?.title}</strong>
              </span>
            )}
          </div>
        </div>

        {/* Table */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px 0' }}>
            <i className="fa-solid fa-spinner fa-spin" style={{ fontSize: '2rem', color: '#0284c7' }}></i>
            <p style={{ marginTop: '12px', color: '#64748b' }}>Loading tours...</p>
          </div>
        ) : filteredTours.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 0', color: '#94a3b8' }}>
            <i className="fa-solid fa-folder-open" style={{ fontSize: '2.5rem', marginBottom: '12px', opacity: 0.5 }}></i>
            <h3>No tours found in this view</h3>
            <p style={{ fontSize: '0.88rem' }}>Click &quot;Add New Tour&quot; above to create a tour for this section.</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.88rem' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #f1f5f9', color: '#64748b', textTransform: 'uppercase', fontSize: '0.75rem' }}>
                  <th style={{ padding: '12px' }}>Tour</th>
                  <th style={{ padding: '12px' }}>Assigned Section</th>
                  <th style={{ padding: '12px' }}>Category</th>
                  <th style={{ padding: '12px' }}>Price</th>
                  <th style={{ padding: '12px' }}>Duration</th>
                  <th style={{ padding: '12px' }}>Rating</th>
                  <th style={{ padding: '12px' }}>Visibility</th>
                  <th style={{ padding: '12px', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredTours.map((t) => {
                  const priceStr = typeof t.price === 'object' ? `${t.price.currency || 'AED'} ${t.price.amount}` : (typeof t.price === 'number' ? `AED ${t.price}` : t.price);
                  const img = (t.images && t.images[0]) || '/assets/cards/card5.jpg';
                  const durStr = formatDurationString(t.duration || t.hours);

                  const assignedSec = TOUR_SECTIONS.find((s) => s.id === (t.section || '').toLowerCase()) || {
                    short: t.section || 'Dubai',
                    title: 'Dubai',
                    icon: 'fa-location-dot',
                    color: '#64748b',
                    bg: '#f1f5f9',
                  };

                  return (
                    <tr key={t._id} style={{ borderBottom: '1px solid #f8fafc' }}>
                      <td style={{ padding: '14px 12px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <img
                            src={img}
                            alt=""
                            style={{ width: '48px', height: '48px', borderRadius: '8px', objectFit: 'cover' }}
                            onError={(e) => { e.target.src = '/assets/cards/card5.jpg'; }}
                          />
                          <div>
                            <div style={{ fontWeight: 700, color: '#0f172a' }}>{t.title}</div>
                            <div style={{ fontSize: '0.78rem', color: '#94a3b8' }}>
                              <i className="fa-solid fa-location-dot" style={{ marginRight: '4px' }}></i>
                              {t.location || 'Dubai, UAE'}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Section Pill Badge */}
                      <td style={{ padding: '14px 12px' }}>
                        <span
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '6px',
                            padding: '4px 10px',
                            borderRadius: '16px',
                            fontSize: '0.78rem',
                            fontWeight: 600,
                            background: assignedSec.bg,
                            color: assignedSec.color,
                          }}
                        >
                          <i className={`fa-solid ${assignedSec.icon}`}></i>
                          {assignedSec.short}
                        </span>
                      </td>

                      <td style={{ padding: '14px 12px', color: '#475569' }}>{t.category || 'Sightseeing'}</td>
                      <td style={{ padding: '14px 12px', fontWeight: 700, color: '#0284c7' }}>{priceStr}</td>
                      <td style={{ padding: '14px 12px', color: '#64748b' }}>{durStr}</td>
                      <td style={{ padding: '14px 12px', color: '#eab308' }}>
                        <i className="fa-solid fa-star"></i> {t.rating || 4.8}
                      </td>
                      <td style={{ padding: '14px 12px' }}>
                        <span
                          style={{
                            padding: '4px 8px',
                            borderRadius: '12px',
                            fontSize: '0.75rem',
                            fontWeight: 600,
                            background: t.isActive !== false ? '#dcfce7' : '#fee2e2',
                            color: t.isActive !== false ? '#15803d' : '#b91c1c',
                          }}
                        >
                          {t.isActive !== false ? 'Active' : 'Draft'}
                        </span>
                      </td>
                      <td style={{ padding: '14px 12px', textAlign: 'right', whiteSpace: 'nowrap' }}>
                        <button
                          onClick={() => handleEdit(t)}
                          style={{
                            padding: '6px 12px',
                            borderRadius: '6px',
                            background: '#f1f5f9',
                            border: 'none',
                            cursor: 'pointer',
                            marginRight: '6px',
                            fontSize: '0.82rem',
                          }}
                        >
                          <i className="fa-solid fa-pen-to-square"></i> Edit
                        </button>
                        <button
                          onClick={() => setDeleteTarget(t)}
                          style={{
                            padding: '6px 12px',
                            borderRadius: '6px',
                            background: '#fee2e2',
                            color: '#dc2626',
                            border: 'none',
                            cursor: 'pointer',
                            fontSize: '0.82rem',
                          }}
                        >
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

      {/* Edit / Create Modal with Section Selection */}
      {editingTour && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(11,25,44,0.7)',
            zIndex: 99999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '16px',
          }}
          onClick={() => setEditingTour(null)}
        >
          <div
            style={{
              background: '#fff',
              borderRadius: '20px',
              maxWidth: '680px',
              width: '100%',
              padding: '28px',
              maxHeight: '90vh',
              overflowY: 'auto',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
              <h3 style={{ margin: 0, fontSize: '1.3rem', fontWeight: 800, color: '#0f172a' }}>
                {editingTour.isNew ? 'Create New Tour' : 'Edit Tour'}
              </h3>
              <button
                type="button"
                onClick={() => setEditingTour(null)}
                style={{ background: 'transparent', border: 'none', fontSize: '1.2rem', color: '#94a3b8', cursor: 'pointer' }}
              >
                <i className="fa-solid fa-xmark"></i>
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: '6px' }}>Tour Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Sunset Desert Safari & BBQ Dinner"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                />
              </div>

              {/* Section Selector: Core new feature for 6 sliders */}
              <div style={{ marginBottom: '16px', background: '#f8fafc', padding: '14px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 700, color: '#0f172a', marginBottom: '6px' }}>
                  <i className="fa-solid fa-sliders" style={{ color: '#0284c7', marginRight: '6px' }}></i>
                  Tour Section (Slider Placement) *
                </label>
                <select
                  value={form.section}
                  onChange={(e) => setForm({ ...form, section: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    fontWeight: 600,
                    background: '#ffffff',
                    color: '#0f172a',
                    outline: 'none',
                  }}
                >
                  {TOUR_SECTIONS.map((sec, idx) => (
                    <option key={sec.id} value={sec.id}>
                      {idx + 1}. {sec.title}
                    </option>
                  ))}
                </select>
                <p style={{ margin: '6px 0 0', fontSize: '0.78rem', color: '#64748b' }}>
                  Determines which of the 6 homepage sliders this tour is placed in.
                </p>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px', marginBottom: '14px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: '6px' }}>Category</label>
                  <input
                    type="text"
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                    placeholder="Sightseeing"
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: '6px' }}>Price *</label>
                  <input
                    type="number"
                    required
                    value={form.price}
                    onChange={(e) => setForm({ ...form, price: e.target.value })}
                    placeholder="150"
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: '6px' }}>Currency</label>
                  <input
                    type="text"
                    value={form.currency}
                    onChange={(e) => setForm({ ...form, currency: e.target.value })}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '14px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: '6px' }}>
                    Duration (e.g. 06-Hrs or 3 Days)
                  </label>
                  <input
                    type="text"
                    value={form.duration}
                    onChange={(e) => setForm({ ...form, duration: e.target.value })}
                    placeholder="06-Hrs"
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: '6px' }}>Location</label>
                  <input
                    type="text"
                    value={form.location}
                    onChange={(e) => setForm({ ...form, location: e.target.value })}
                    placeholder="Dubai Desert, UAE"
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px', marginBottom: '14px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: '6px' }}>Vehicle / Transport</label>
                  <input
                    type="text"
                    value={form.vehicle}
                    onChange={(e) => setForm({ ...form, vehicle: e.target.value })}
                    placeholder="4WD Cruiser"
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: '6px' }}>Guide / Host</label>
                  <input
                    type="text"
                    value={form.guide}
                    onChange={(e) => setForm({ ...form, guide: e.target.value })}
                    placeholder="Driver-guide"
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: '6px' }}>Capacity / Group Size</label>
                  <input
                    type="text"
                    value={form.capacity}
                    onChange={(e) => setForm({ ...form, capacity: e.target.value })}
                    placeholder="6 Persons"
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                  />
                </div>
              </div>

              <ImageUploadField
                label="Cover Image"
                value={form.image}
                onChange={(val) => setForm({ ...form, image: val })}
                folder="airdream/tours"
              />

              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: '6px' }}>Description</label>
                <textarea
                  rows={3}
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                />
              </div>

              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: '6px' }}>Highlights (One per line)</label>
                <textarea
                  rows={3}
                  value={form.highlights}
                  onChange={(e) => setForm({ ...form, highlights: e.target.value })}
                  placeholder="Dune Bashing 4x4&#10;BBQ Buffet Dinner&#10;Live Tanoura Show"
                  style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                />
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
                <input
                  type="checkbox"
                  id="tourActive"
                  checked={form.isActive}
                  onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
                />
                <label htmlFor="tourActive" style={{ fontSize: '0.88rem', fontWeight: 600 }}>
                  Active (Visible on Website)
                </label>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button
                  type="button"
                  onClick={() => setEditingTour(null)}
                  style={{ padding: '8px 16px', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#fff', cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{
                    padding: '8px 20px',
                    borderRadius: '8px',
                    background: '#0284c7',
                    color: '#fff',
                    border: 'none',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  Save Tour
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ConfirmModal
        isOpen={!!deleteTarget}
        title="Delete Tour"
        message={`Are you sure you want to delete "${deleteTarget?.title}"?`}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}