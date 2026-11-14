import React, { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import FloatingWidgets from '../components/FloatingWidgets';
import BookingModal from '../components/BookingModal';
import QuoteModal from '../components/QuoteModal';

export default function PublicLayout() {
  const [bookingModalOpen, setBookingModalOpen] = useState(false);
  const [bookingTitle, setBookingTitle] = useState('');
  const [bookingPrice, setBookingPrice] = useState('');

  const [quoteModalOpen, setQuoteModalOpen] = useState(false);
  const [quoteTitle, setQuoteTitle] = useState('Request a Custom Quote');

  const location = useLocation();

  const handleOpenQuote = (title = 'Request a Custom Quote') => {
    setQuoteTitle(title);
    setQuoteModalOpen(true);
  };

  const handleBookItem = (title, price = '') => {
    setBookingTitle(title);
    setBookingPrice(price);
    setBookingModalOpen(true);
  };

  return (
    <div className="airdream-app-public" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar onOpenQuote={handleOpenQuote} />

      <main style={{ flex: 1 }}>
        <Outlet context={{ onBookItem: handleBookItem, onOpenQuote: handleOpenQuote }} />
      </main>

      <Footer onOpenQuote={handleOpenQuote} />
      <FloatingWidgets onOpenQuote={handleOpenQuote} />

      <BookingModal
        isOpen={bookingModalOpen}
        title={bookingTitle}
        price={bookingPrice}
        onClose={() => setBookingModalOpen(false)}
      />

      <QuoteModal
        isOpen={quoteModalOpen}
        initialTitle={quoteTitle}
        onClose={() => setQuoteModalOpen(false)}
      />
    </div>
  );
}
