import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import adminApi from '../../services/adminApi';
import toast from 'react-hot-toast';

export default function DashboardPage() {
  const [stats, setStats] = useState({
    totalEnquiries: 0,
    newEnquiries: 0,
    contactedEnquiries: 0,
    convertedEnquiries: 0,
    toursCount: 0,
    packagesCount: 0,
    activitiesCount: 0,
  });
  const [recentEnquiries, setRecentEnquiries] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [enqRes, tours, packages, activities] = await Promise.all([
        adminApi.getEnquiries({ limit: 100 }),
        adminApi.resource('tours').list(),
        adminApi.resource('travel-deals').list(),
        adminApi.resource('activities').list(),
      ]);

      const enquiriesList = enqRes.data || [];
      const newCount = enquiriesList.filter((e) => e.status === 'New').length;
      const contactedCount = enquiriesList.filter((e) => e.status === 'Contacted').length;
      const convertedCount = enquiriesList.filter((e) => e.status === 'Converted').length;

      setStats({
        totalEnquiries: enqRes.meta?.total || enquiriesList.length,
        newEnquiries: newCount,
        contactedEnquiries: contactedCount,
        convertedEnquiries: convertedCount,
        toursCount: Array.isArray(tours) ? tours.length : 0,
        packagesCount: Array.isArray(packages) ? packages.length : 0,
        activitiesCount: Array.isArray(activities) ? activities.length : 0,
      });

      setRecentEnquiries(enquiriesList.slice(0, 5));
    } catch (err) {
      console.error(err);
      toast.error('Could not load dashboard statistics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  const handleQuickStatusChange = async (enquiryId, newStatus) => {
    try {
      await adminApi.updateEnquiry(enquiryId, { status: newStatus });
      toast.success(`Enquiry status updated to ${newStatus}`);
      loadDashboardData();
    } catch {
      toast.error('Failed to update status');
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '80px 0' }}>
        <i className="fa-solid fa-spinner fa-spin" style={{ fontSize: '2.5rem', color: '#0284c7' }}></i>
        <p style={{ marginTop: '16px', color: '#64748b' }}>Loading dashboard overview...</p>
      </div>
    );
  }

  const statCards = [
    { label: 'Total Enquiries', value: stats.totalEnquiries, icon: 'fa-envelope', color: '#0284c7', bg: '#e0f2fe' },
    { label: 'New Enquiries', value: stats.newEnquiries, icon: 'fa-bell', color: '#ea580c', bg: '#ffedd5' },
    { label: 'In Contact / Quoted', value: stats.contactedEnquiries, icon: 'fa-comments', color: '#ca8a04', bg: '#fef9c3' },
    { label: 'Converted Bookings', value: stats.convertedEnquiries, icon: 'fa-circle-check', color: '#16a34a', bg: '#dcfce7' },
    { label: 'Active Tours', value: stats.toursCount, icon: 'fa-mountain-sun', color: '#0d9488', bg: '#ccfbf1' },
    { label: 'Packages & Deals', value: stats.packagesCount, icon: 'fa-suitcase-rolling', color: '#7c3aed', bg: '#f3e8ff' },
  ];

  return (
    <div>
      {/* Title */}
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ margin: 0, fontSize: '1.6rem', fontWeight: 800, color: '#0f172a' }}>Dashboard Overview</h1>
        <p style={{ margin: '4px 0 0 0', color: '#64748b', fontSize: '0.9rem' }}>Real-time inquiries, booking leads, and content statistics.</p>
      </div>

      {/* Stats Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px', marginBottom: '36px' }}>
        {statCards.map((c, i) => (
          <div
            key={i}
            style={{
              background: '#fff',
              borderRadius: '16px',
              padding: '20px',
              boxShadow: '0 2px 10px rgba(0,0,0,0.04)',
              display: 'flex',
              alignItems: 'center',
              gap: '16px',
            }}
          >
            <div
              style={{
                width: '52px',
                height: '52px',
                borderRadius: '14px',
                background: c.bg,
                color: c.color,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.35rem',
                flexShrink: 0,
              }}
            >
              <i className={`fa-solid ${c.icon}`}></i>
            </div>
            <div>
              <span style={{ display: 'block', fontSize: '0.78rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>
                {c.label}
              </span>
              <span style={{ fontSize: '1.6rem', fontWeight: 800, color: '#0f172a' }}>{c.value}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Enquiries Section */}
      <div style={{ background: '#fff', borderRadius: '18px', padding: '24px', boxShadow: '0 4px 16px rgba(0,0,0,0.04)', marginBottom: '32px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
          <div>
            <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 700, color: '#0f172a' }}>Recent Customer Inquiries</h2>
            <p style={{ margin: '2px 0 0 0', color: '#64748b', fontSize: '0.82rem' }}>Latest booking and quotation requests submitted through the website.</p>
          </div>
          <Link
            to="/admin/enquiries"
            style={{
              padding: '8px 14px',
              borderRadius: '8px',
              background: '#f1f5f9',
              color: '#0284c7',
              textDecoration: 'none',
              fontWeight: 600,
              fontSize: '0.82rem',
            }}
          >
            View All Enquiries ({stats.totalEnquiries}) &rarr;
          </Link>
        </div>

        {recentEnquiries.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 0', color: '#94a3b8' }}>
            <p>No inquiries found.</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.88rem' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #f1f5f9', color: '#64748b', textTransform: 'uppercase', fontSize: '0.75rem' }}>
                  <th style={{ padding: '12px' }}>Customer</th>
                  <th style={{ padding: '12px' }}>Requested Service</th>
                  <th style={{ padding: '12px' }}>Submitted</th>
                  <th style={{ padding: '12px' }}>Status</th>
                  <th style={{ padding: '12px', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {recentEnquiries.map((enq) => {
                  const statusColors = {
                    New: { bg: '#ffedd5', color: '#c2410c' },
                    Contacted: { bg: '#fef9c3', color: '#a16207' },
                    Quoted: { bg: '#e0f2fe', color: '#0369a1' },
                    Converted: { bg: '#dcfce7', color: '#15803d' },
                    Closed: { bg: '#f1f5f9', color: '#64748b' },
                  };
                  const sStyle = statusColors[enq.status] || statusColors.New;
                  const dateStr = enq.createdAt ? new Date(enq.createdAt).toLocaleDateString() : 'Recent';

                  return (
                    <tr key={enq._id} style={{ borderBottom: '1px solid #f8fafc' }}>
                      <td style={{ padding: '14px 12px' }}>
                        <div style={{ fontWeight: 600, color: '#0f172a' }}>{enq.fullName}</div>
                        <div style={{ fontSize: '0.78rem', color: '#64748b' }}>{enq.email} | {enq.phone}</div>
                      </td>
                      <td style={{ padding: '14px 12px', color: '#334155' }}>
                        <span style={{ fontWeight: 500 }}>{enq.serviceRequired}</span>
                        {enq.destination && <span style={{ display: 'block', fontSize: '0.78rem', color: '#94a3b8' }}>Dest: {enq.destination}</span>}
                      </td>
                      <td style={{ padding: '14px 12px', color: '#64748b', fontSize: '0.82rem' }}>
                        {dateStr}
                      </td>
                      <td style={{ padding: '14px 12px' }}>
                        <select
                          value={enq.status}
                          onChange={(e) => handleQuickStatusChange(enq._id, e.target.value)}
                          style={{
                            padding: '4px 10px',
                            borderRadius: '12px',
                            border: 'none',
                            background: sStyle.bg,
                            color: sStyle.color,
                            fontWeight: 700,
                            fontSize: '0.78rem',
                            cursor: 'pointer',
                          }}
                        >
                          <option value="New">New</option>
                          <option value="Contacted">Contacted</option>
                          <option value="Quoted">Quoted</option>
                          <option value="Converted">Converted</option>
                          <option value="Closed">Closed</option>
                        </select>
                      </td>
                      <td style={{ padding: '14px 12px', textAlign: 'right' }}>
                        <a
                          href={`https://wa.me/${(enq.phone || '').replace(/[^0-9]/g, '')}`}
                          target="_blank"
                          rel="noreferrer"
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            padding: '6px 10px',
                            borderRadius: '6px',
                            background: '#dcfce7',
                            color: '#15803d',
                            textDecoration: 'none',
                            fontSize: '0.78rem',
                            fontWeight: 600,
                          }}
                        >
                          <i className="fa-brands fa-whatsapp"></i> Chat
                        </a>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
