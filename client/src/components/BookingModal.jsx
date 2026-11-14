import React, { useState } from 'react';
import publicApi from '../services/publicApi';
import toast from 'react-hot-toast';

export default function BookingModal({ isOpen, title, price, onClose }) {
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [formData, setFormData] = useState({
    custName: '',
    custEmail: '',
    custPhone: '',
    custDate: '',
    custCount: '2 Persons',
    custPayment: 'Credit / Debit Card (Online 3D Secure)',
    custNotes: '',
  });

  if (!isOpen) return null;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (errorMsg) setErrorMsg('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!formData.custName.trim() || !formData.custEmail.trim() || !formData.custPhone.trim()) {
      setErrorMsg('Please fill in your name, email, and contact number.');
      return;
    }

    setLoading(true);

    try {
      const payload = {
        fullName: formData.custName.trim(),
        email: formData.custEmail.trim(),
        phone: formData.custPhone.trim(),
        serviceRequired: title || 'Booking Reservation',
        travelDate: formData.custDate || 'Flexible',
        travellerCount: formData.custCount,
        paymentPreference: formData.custPayment,
        message: `Date: ${formData.custDate || 'Flexible'} | Guests: ${formData.custCount} | Payment: ${formData.custPayment} | Notes: ${formData.custNotes || 'None'}`,
        source: 'booking-modal',
      };

      const res = await publicApi.submitEnquiry(payload);

      if (res && res.success) {
        setSubmitted(true);
        toast.success('Booking request received! Our concierge will contact you shortly.');
        setTimeout(() => {
          setSubmitted(false);
          setFormData({
            custName: '',
            custEmail: '',
            custPhone: '',
            custDate: '',
            custCount: '2 Persons',
            custPayment: 'Credit / Debit Card (Online 3D Secure)',
            custNotes: '',
          });
          onClose();
        }, 1800);
      } else {
        throw new Error(res?.message || 'Could not submit booking request.');
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
        {/* Modal Header */}
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
              transition: 'background 0.2s',
            }}
          >
            <i className="fa-solid fa-xmark"></i>
          </button>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: '#00d2ff', fontSize: '0.85rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '6px' }}>
            <i className="fa-solid fa-paper-plane"></i> Quick Reservation
          </div>
          <h3 style={{ margin: 0, fontSize: '1.4rem', fontWeight: 700, fontFamily: 'Poppins, sans-serif' }}>
            {title || 'Book Your Experience'}
          </h3>
          {price && (
            <div style={{ marginTop: '8px', display: 'inline-block', background: 'rgba(0, 210, 255, 0.15)', border: '1px solid rgba(0, 210, 255, 0.3)', color: '#00d2ff', padding: '4px 12px', borderRadius: '12px', fontSize: '0.9rem', fontWeight: 600 }}>
              Rate: {price}
            </div>
          )}
        </div>

        {/* Modal Body */}
        <div style={{ padding: '24px 28px', maxHeight: '75vh', overflowY: 'auto' }}>
          {submitted ? (
            <div style={{ textAlign: 'center', padding: '40px 16px' }}>
              <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: '#dcfce7', color: '#16a34a', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', marginBottom: '16px' }}>
                <i className="fa-solid fa-check"></i>
              </div>
              <h4 style={{ margin: '0 0 8px 0', fontSize: '1.25rem', color: '#0f172a' }}>Reservation Requested!</h4>
              <p style={{ margin: 0, color: '#64748b', fontSize: '0.95rem' }}>
                Thank you! Our travel specialist will verify availability and send confirmation via WhatsApp / Email.
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

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '14px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                    Full Name *
                  </label>
                  <input
                    type="text"
                    name="custName"
                    required
                    value={formData.custName}
                    onChange={handleChange}
                    placeholder="e.g. John Smith"
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.9rem' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                    WhatsApp / Phone *
                  </label>
                  <input
                    type="tel"
                    name="custPhone"
                    required
                    value={formData.custPhone}
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
                  name="custEmail"
                  required
                  value={formData.custEmail}
                  onChange={handleChange}
                  placeholder="name@example.com"
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.9rem' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '14px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                    Preferred Date
                  </label>
                  <input
                    type="date"
                    name="custDate"
                    value={formData.custDate}
                    onChange={handleChange}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.9rem' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                    Guests / Travellers
                  </label>
                  <select
                    name="custCount"
                    value={formData.custCount}
                    onChange={handleChange}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.9rem', background: '#fff' }}
                  >
                    <option value="1 Person">1 Person (Solo)</option>
                    <option value="2 Persons">2 Persons (Couple)</option>
                    <option value="3-4 Persons">3 - 4 Persons (Family)</option>
                    <option value="5+ Persons">5+ Persons (Group)</option>
                  </select>
                </div>
              </div>

              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                  Payment Preference
                </label>
                <select
                  name="custPayment"
                  value={formData.custPayment}
                  onChange={handleChange}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.9rem', background: '#fff' }}
                >
                  <option value="Credit / Debit Card (Online 3D Secure)">Credit / Debit Card (Online 3D Secure)</option>
                  <option value="Bank Transfer (UAE / International IBAN)">Bank Transfer (UAE / International IBAN)</option>
                  <option value="Cash / POS on Arrival (Dubai)">Cash / POS on Arrival (Dubai)</option>
                </select>
              </div>

              <div style={{ marginBottom: '18px' }}>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                  Special Requests / Pick-up Hotel
                </label>
                <textarea
                  name="custNotes"
                  rows={2}
                  value={formData.custNotes}
                  onChange={handleChange}
                  placeholder="Hotel name, room number, or special requirements..."
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
                    <span>Submitting Request...</span>
                  </>
                ) : (
                  <>
                    <i className="fa-solid fa-check"></i>
                    <span>Confirm Reservation Request</span>
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
