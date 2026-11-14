import React, { useState, useEffect } from 'react';
import publicApi from '../services/publicApi';
import toast from 'react-hot-toast';

export default function QuoteModal({ isOpen, initialTitle, onClose }) {
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [formData, setFormData] = useState({
    quoteName: '',
    quoteEmail: '',
    quotePhone: '',
    quoteService: initialTitle || 'Spiritual Umrah / Hajj',
    quotePax: '2 Adults',
    quoteBudget: 'Standard ($1,000 - $2,500)',
    quoteMessage: '',
  });

  useEffect(() => {
    if (initialTitle) {
      setFormData((prev) => ({
        ...prev,
        quoteService: initialTitle,
      }));
    }
  }, [initialTitle, isOpen]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (errorMsg) setErrorMsg('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!formData.quoteName.trim() || !formData.quoteEmail.trim() || !formData.quotePhone.trim()) {
      setErrorMsg('Please enter your full name, email, and phone number.');
      return;
    }

    setLoading(true);

    try {
      const payload = {
        fullName: formData.quoteName.trim(),
        email: formData.quoteEmail.trim(),
        phone: formData.quotePhone.trim(),
        serviceRequired: formData.quoteService || initialTitle || 'Custom Quote Request',
        travellerCount: formData.quotePax,
        budget: formData.quoteBudget,
        message: `Passengers: ${formData.quotePax} | Budget: ${formData.quoteBudget} | Notes: ${formData.quoteMessage || 'None'}`,
        source: 'quote-modal',
      };

      const res = await publicApi.submitEnquiry(payload);

      if (res && res.success) {
        setSubmitted(true);
        toast.success('Quote request sent! We will prepare a personalized itinerary for you.');
        setTimeout(() => {
          setSubmitted(false);
          setFormData({
            quoteName: '',
            quoteEmail: '',
            quotePhone: '',
            quoteService: initialTitle || 'Spiritual Umrah / Hajj',
            quotePax: '2 Adults',
            quoteBudget: 'Standard ($1,000 - $2,500)',
            quoteMessage: '',
          });
          onClose();
        }, 1800);
      } else {
        throw new Error(res?.message || 'Could not submit quote request.');
      }
    } catch (err) {
      const message = err.response?.data?.message || err.message || 'Submission failed. Please check details.';
      setErrorMsg(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="airdream-modal-overlay active"
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(11, 25, 44, 0.75)',
        backdropFilter: 'blur(6px)',
        zIndex: 99999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
      }}
    >
      <div
        className="airdream-modal-card"
        onClick={(e) => e.stopPropagation()}
        style={{
          background: '#ffffff',
          borderRadius: '20px',
          width: '100%',
          maxWidth: '560px',
          boxShadow: '0 25px 60px rgba(0, 0, 0, 0.3)',
          overflow: 'hidden',
          position: 'relative',
          animation: 'fadeInUp 0.3s ease-out forwards',
        }}
      >
        {/* Header */}
        <div
          style={{
            background: 'linear-gradient(135deg, #0b192c 0%, #1e3a5f 100%)',
            padding: '24px 28px',
            color: '#ffffff',
            position: 'relative',
          }}
        >
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            style={{
              position: 'absolute',
              top: '20px',
              right: '20px',
              background: 'rgba(255, 255, 255, 0.15)',
              border: 'none',
              color: '#ffffff',
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              fontSize: '1rem',
            }}
          >
            <i className="fa-solid fa-xmark"></i>
          </button>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: '#38bdf8', fontSize: '0.85rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '6px' }}>
            <i className="fa-solid fa-file-invoice-dollar"></i> Customized Itinerary
          </div>
          <h3 style={{ margin: 0, fontSize: '1.4rem', fontWeight: 700, fontFamily: 'Poppins, sans-serif' }}>
            Request a Tailored Quote
          </h3>
        </div>

        {/* Body */}
        <div style={{ padding: '24px 28px', maxHeight: '75vh', overflowY: 'auto' }}>
          {submitted ? (
            <div style={{ textAlign: 'center', padding: '40px 16px' }}>
              <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: '#dcfce7', color: '#16a34a', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', marginBottom: '16px' }}>
                <i className="fa-solid fa-check"></i>
              </div>
              <h4 style={{ margin: '0 0 8px 0', fontSize: '1.25rem', color: '#0f172a' }}>Quote Request Sent!</h4>
              <p style={{ margin: 0, color: '#64748b', fontSize: '0.95rem' }}>
                Our travel concierge will design an exclusive customized package and contact you with the best rates.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              {errorMsg && (
                <div style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626', padding: '10px 14px', borderRadius: '8px', marginBottom: '16px', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <i className="fa-solid fa-circle-exclamation"></i>
                  <span>{errorMsg}</span>
                </div>
              )}

              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                  Service / Package of Interest
                </label>
                <input
                  type="text"
                  name="quoteService"
                  value={formData.quoteService}
                  onChange={handleChange}
                  placeholder="e.g. 5-Star Umrah Package or Dubai Family Tour"
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.9rem' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '14px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                    Full Name *
                  </label>
                  <input
                    type="text"
                    name="quoteName"
                    required
                    value={formData.quoteName}
                    onChange={handleChange}
                    placeholder="e.g. Sarah Jenkins"
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.9rem' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                    WhatsApp / Phone *
                  </label>
                  <input
                    type="tel"
                    name="quotePhone"
                    required
                    value={formData.quotePhone}
                    onChange={handleChange}
                    placeholder="+971 58 123 4567"
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.9rem' }}
                  />
                </div>
              </div>

              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                  Email Address *
                </label>
                <input
                  type="email"
                  name="quoteEmail"
                  required
                  value={formData.quoteEmail}
                  onChange={handleChange}
                  placeholder="sarah@example.com"
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.9rem' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '14px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                    Passengers
                  </label>
                  <select
                    name="quotePax"
                    value={formData.quotePax}
                    onChange={handleChange}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.9rem', background: '#fff' }}
                  >
                    <option value="1 Adult">1 Adult</option>
                    <option value="2 Adults">2 Adults</option>
                    <option value="Family (2 Adults + Children)">Family (2 Adults + Children)</option>
                    <option value="Group (5+ Adults)">Group (5+ Adults)</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                    Budget Range
                  </label>
                  <select
                    name="quoteBudget"
                    value={formData.quoteBudget}
                    onChange={handleChange}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.9rem', background: '#fff' }}
                  >
                    <option value="Economy ($500 - $1,000)">Economy ($500 - $1,000)</option>
                    <option value="Standard ($1,000 - $2,500)">Standard ($1,000 - $2,500)</option>
                    <option value="Luxury / 5-Star ($2,500 - $5,000)">Luxury / 5-Star ($2,500 - $5,000)</option>
                    <option value="VIP Royal ($5,000+)">VIP Royal ($5,000+)</option>
                  </select>
                </div>
              </div>

              <div style={{ marginBottom: '18px' }}>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                  Trip Dates & Specific Requirements
                </label>
                <textarea
                  name="quoteMessage"
                  rows={2}
                  value={formData.quoteMessage}
                  onChange={handleChange}
                  placeholder="Travel dates, hotel preferences, preferred flights..."
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.9rem', resize: 'vertical' }}
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                style={{
                  width: '100%',
                  background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '10px',
                  padding: '13px 18px',
                  fontWeight: 600,
                  fontSize: '0.95rem',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  opacity: loading ? 0.75 : 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  boxShadow: '0 4px 12px rgba(2, 132, 199, 0.35)',
                }}
              >
                {loading ? (
                  <>
                    <i className="fa-solid fa-spinner fa-spin"></i>
                    <span>Sending Quote Request...</span>
                  </>
                ) : (
                  <>
                    <i className="fa-solid fa-paper-plane"></i>
                    <span>Request Custom Itinerary</span>
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
