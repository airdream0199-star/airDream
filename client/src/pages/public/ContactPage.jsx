import React, { useState } from 'react';
import { useSiteData } from '../../context/SiteDataContext';
import publicApi from '../../services/publicApi';
import toast from 'react-hot-toast';

export default function ContactPage() {
  const { siteData } = useSiteData();
  const settings = siteData?.settings || {};

  const [form, setForm] = useState({
    fullName: '',
    email: '',
    phone: '',
    destination: '',
    serviceRequired: 'General Inquiry',
    message: '',
  });
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.fullName.trim() || !form.email.trim() || !form.phone.trim()) {
      toast.error('Please provide your name, email, and contact number.');
      return;
    }

    setLoading(true);
    try {
      const res = await publicApi.submitEnquiry({
        ...form,
        source: 'contact-page',
      });
      if (res && res.success) {
        setSent(true);
        toast.success('Your message has been sent to our travel team!');
        setForm({
          fullName: '',
          email: '',
          phone: '',
          destination: '',
          serviceRequired: 'General Inquiry',
          message: '',
        });
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error submitting message. Please call or WhatsApp us.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ paddingTop: '100px', paddingBottom: '80px', background: '#f8fafc', minHeight: '100vh' }}>
      <div style={{ background: 'linear-gradient(135deg, #0b192c 0%, #1e3a5f 100%)', color: '#fff', padding: '60px 20px', textAlign: 'center', marginBottom: '40px' }}>
        <h1 style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: '12px', fontFamily: 'Poppins, sans-serif' }}>
          Contact Air Dream Travel
        </h1>
        <p style={{ maxWidth: '650px', margin: '0 auto', color: '#94a3b8', fontSize: '1.05rem' }}>
          Visit our Dubai headquarters, call our concierge hotline, or drop us a line below.
        </p>
      </div>

      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '0 20px', display: 'grid', gridTemplateColumns: '1fr 1.4fr', gap: '40px' }}>
        {/* Info Column */}
        <div>
          <div style={{ background: '#fff', padding: '32px', borderRadius: '20px', boxShadow: '0 4px 16px rgba(0,0,0,0.06)', marginBottom: '24px' }}>
            <h3 style={{ margin: '0 0 20px 0', fontSize: '1.3rem', color: '#0f172a' }}>Office & Contact Info</h3>

            <div style={{ display: 'flex', gap: '16px', marginBottom: '20px' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#e0f2fe', color: '#0284c7', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <i className="fa-solid fa-location-dot"></i>
              </div>
              <div>
                <span style={{ display: 'block', fontSize: '0.8rem', color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase' }}>Location</span>
                <span style={{ fontSize: '0.95rem', color: '#334155', lineHeight: 1.5 }}>
                  {settings.address || 'Office 402, Al Asmawi Building, Sheikh Zayed Road, Dubai, UAE'}
                </span>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '16px', marginBottom: '20px' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#dcfce7', color: '#16a34a', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <i className="fa-brands fa-whatsapp"></i>
              </div>
              <div>
                <span style={{ display: 'block', fontSize: '0.8rem', color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase' }}>WhatsApp</span>
                <a href={`https://wa.me/${settings.whatsapp || '971588338927'}`} target="_blank" rel="noreferrer" style={{ fontSize: '0.95rem', color: '#16a34a', fontWeight: 600, textDecoration: 'none' }}>
                  +{settings.whatsapp || '971 58 833 8927'}
                </a>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '16px', marginBottom: '20px' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#e0e7ff', color: '#4f46e5', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <i className="fa-solid fa-phone"></i>
              </div>
              <div>
                <span style={{ display: 'block', fontSize: '0.8rem', color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase' }}>Phone</span>
                <a href={`tel:${settings.phone || '+971588338927'}`} style={{ fontSize: '0.95rem', color: '#334155', fontWeight: 600, textDecoration: 'none' }}>
                  {settings.phone || '+971 58 833 8927'}
                </a>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '16px' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#fef3c7', color: '#d97706', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <i className="fa-solid fa-envelope"></i>
              </div>
              <div>
                <span style={{ display: 'block', fontSize: '0.8rem', color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase' }}>Email</span>
                <a href={`mailto:${settings.email || 'info@airdreamtravel.com'}`} style={{ fontSize: '0.95rem', color: '#0284c7', textDecoration: 'none' }}>
                  {settings.email || 'info@airdreamtravel.com'}
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Form Column */}
        <div style={{ background: '#fff', padding: '36px', borderRadius: '20px', boxShadow: '0 4px 16px rgba(0,0,0,0.06)' }}>
          <h3 style={{ margin: '0 0 8px 0', fontSize: '1.4rem', color: '#0f172a' }}>Send Us a Message</h3>
          <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '24px' }}>
            Fill out the form and our Dubai team will respond within 2-4 business hours.
          </p>

          {sent ? (
            <div style={{ textAlign: 'center', padding: '40px 10px' }}>
              <i className="fa-solid fa-circle-check" style={{ fontSize: '3rem', color: '#16a34a', marginBottom: '14px' }}></i>
              <h4 style={{ margin: '0 0 8px', fontSize: '1.2rem', color: '#0f172a' }}>Message Received!</h4>
              <p style={{ color: '#64748b' }}>Our specialist will contact you on WhatsApp or Email shortly.</p>
              <button onClick={() => setSent(false)} style={{ marginTop: '16px', padding: '8px 18px', background: '#f1f5f9', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 600 }}>
                Send Another Message
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '14px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>Full Name *</label>
                  <input
                    type="text"
                    name="fullName"
                    required
                    value={form.fullName}
                    onChange={handleChange}
                    placeholder="Your Name"
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.9rem' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>WhatsApp / Phone *</label>
                  <input
                    type="tel"
                    name="phone"
                    required
                    value={form.phone}
                    onChange={handleChange}
                    placeholder="+971 58 123 4567"
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.9rem' }}
                  />
                </div>
              </div>

              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>Email Address *</label>
                <input
                  type="email"
                  name="email"
                  required
                  value={form.email}
                  onChange={handleChange}
                  placeholder="name@example.com"
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.9rem' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '14px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>Desired Destination</label>
                  <input
                    type="text"
                    name="destination"
                    value={form.destination}
                    onChange={handleChange}
                    placeholder="e.g. Dubai, Georgia, Baku"
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.9rem' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>Service Type</label>
                  <select
                    name="serviceRequired"
                    value={form.serviceRequired}
                    onChange={handleChange}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.9rem', background: '#fff' }}
                  >
                    <option value="General Inquiry">General Inquiry</option>
                    <option value="Dubai Tours">Dubai City & Desert Tours</option>
                    <option value="Holiday Packages">Holiday Packages</option>
                    <option value="Umrah Packages">Umrah & Hajj</option>
                    <option value="Airport Transfer">Airport Transfer</option>
                    <option value="Visa Service">Visa Assistance</option>
                  </select>
                </div>
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>Your Message</label>
                <textarea
                  name="message"
                  rows={4}
                  value={form.message}
                  onChange={handleChange}
                  placeholder="How can our travel consultants assist your journey?"
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.9rem', resize: 'vertical' }}
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                style={{
                  width: '100%',
                  padding: '13px',
                  borderRadius: '10px',
                  background: '#0284c7',
                  color: '#fff',
                  border: 'none',
                  fontWeight: 700,
                  fontSize: '0.95rem',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  opacity: loading ? 0.75 : 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                }}
              >
                {loading ? <i className="fa-solid fa-spinner fa-spin"></i> : <i className="fa-solid fa-paper-plane"></i>}
                <span>{loading ? 'Sending Message...' : 'Send Message'}</span>
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
