import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider, useToast } from './context/ToastContext';
import { Navbar } from './components/common/Navbar';
import { Footer } from './components/common/Footer';
import { HeroSection } from './components/landing/HeroSection';
import { FeatureGrid } from './components/landing/FeatureGrid';
import { HowItWorks } from './components/landing/HowItWorks';
import { ImpactStats } from './components/landing/ImpactStats';
import { UserReviews } from './components/landing/UserReviews';
import { ParkingSearch } from './components/driver/ParkingSearch';
import { MyBookings } from './components/driver/MyBookings';
import { BookingModal } from './components/driver/BookingModal';
import { PaymentModal } from './components/driver/PaymentModal';
import { OwnerDashboard } from './components/owner/OwnerDashboard';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { AuthModal } from './components/auth/AuthModal';

function MainApp() {
  const { user, isAuthenticated } = useAuth();
  const { addToast } = useToast();

  // Navigation State - persisted in sessionStorage so refresh keeps the user on same page
  const [currentTab, setCurrentTab] = useState(() => sessionStorage.getItem('smartpark_tab') || 'home');

  // Auth Modal State
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [authTab, setAuthTab] = useState('login');
  const [authRole, setAuthRole] = useState('DRIVER');

  // Booking Flow State
  const [selectedSpotForBooking, setSelectedSpotForBooking] = useState(null);
  const [activeBookingPendingPayment, setActiveBookingPendingPayment] = useState(null);

  const handleOpenAuth = (tab = 'login', role = 'DRIVER') => {
    setAuthTab(tab);
    setAuthRole(role);
    setIsAuthOpen(true);
  };

  const handleNavigate = (tab) => {
    // Role protection for Owner portal
    if (tab === 'owner') {
      if (!isAuthenticated) {
        handleOpenAuth('register', 'OWNER');
        return;
      }
      if (user?.role === 'DRIVER') {
        addToast('Listing a space requires a Space Owner account. Please register or log in as an Owner.', 'error');
        handleOpenAuth('login', 'OWNER');
        return;
      }
    }

    // Role protection for Driver Bookings portal
    if (tab === 'bookings') {
      if (!isAuthenticated) {
        handleOpenAuth('login', 'DRIVER');
        return;
      }
      if (user?.role === 'OWNER') {
        addToast('My Bookings is available for Driver accounts.', 'info');
      }
    }

    setCurrentTab(tab);
    sessionStorage.setItem('smartpark_tab', tab);
  };

  const handleSearchTrigger = (searchParams) => {
    setCurrentTab('search');
    sessionStorage.setItem('smartpark_tab', 'search');
  };

  const handleBookSpot = (spot) => {
    if (!isAuthenticated) {
      handleOpenAuth('register', 'DRIVER');
      return;
    }

    if (user?.role === 'OWNER') {
      addToast('Booking a parking spot requires a Driver account. Please log in or register as a Driver.', 'error');
      handleOpenAuth('login', 'DRIVER');
      return;
    }

    setSelectedSpotForBooking(spot);
  };

  const handleBookingCreated = (booking) => {
    setSelectedSpotForBooking(null);
    setActiveBookingPendingPayment(booking);
  };

  const handlePaymentCompleted = (confirmedBooking) => {
    setActiveBookingPendingPayment(null);
    setCurrentTab('bookings');
    sessionStorage.setItem('smartpark_tab', 'bookings');
  };

  return (
    <div className="app-wrapper">
      <Navbar
        onOpenAuth={handleOpenAuth}
        onNavigate={handleNavigate}
        currentTab={currentTab}
      />

      <main className="app-main">
        {/* LANDING PAGE */}
        {currentTab === 'home' && (
          <>
            <HeroSection onSearch={handleSearchTrigger} />
            <FeatureGrid />
            <HowItWorks
              onNavigate={handleNavigate}
              onOpenAuth={handleOpenAuth}
            />
            <ImpactStats />
            <UserReviews />
          </>
        )}

        {/* PARKING SEARCH & MAP */}
        {currentTab === 'search' && (
          <ParkingSearch
            onSelectSpot={(spot) => handleBookSpot(spot)}
            onBookSpot={(spot) => handleBookSpot(spot)}
          />
        )}

        {/* DRIVER MY BOOKINGS */}
        {currentTab === 'bookings' && <MyBookings />}

        {/* OWNER DASHBOARD */}
        {currentTab === 'owner' && <OwnerDashboard />}

        {/* ADMIN DASHBOARD */}
        {currentTab === 'admin' && <AdminDashboard />}

        {/* HOW IT WORKS PAGE */}
        {currentTab === 'how-it-works' && (
          <div className="py-8">
            <HowItWorks
              onNavigate={handleNavigate}
              onOpenAuth={handleOpenAuth}
            />
            <FeatureGrid />
          </div>
        )}

        {/* PRICING PAGE */}
        {currentTab === 'pricing' && (
          <div className="container py-12">
            <div className="text-center max-w-xl mx-auto mb-12" style={{ textAlign: 'center', padding: '3rem 0' }}>
              <h2 className="text-3xl font-bold mb-3" style={{ fontSize: '2.5rem', fontWeight: 800 }}>Simple, Transparent Pricing</h2>
              <p className="text-slate-500" style={{ color: 'var(--secondary-muted)' }}>No hidden fees. Drivers pay hourly rates set by space owners.</p>
            </div>
            <FeatureGrid />
          </div>
        )}
      </main>

      <Footer />

      {/* Global Modals */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        initialTab={authTab}
        defaultRole={authRole}
      />

      <BookingModal
        isOpen={!!selectedSpotForBooking}
        onClose={() => setSelectedSpotForBooking(null)}
        spot={selectedSpotForBooking}
        onBookingCreated={handleBookingCreated}
      />

      <PaymentModal
        isOpen={!!activeBookingPendingPayment}
        onClose={() => setActiveBookingPendingPayment(null)}
        booking={activeBookingPendingPayment}
        onPaymentCompleted={handlePaymentCompleted}
      />
    </div>
  );
}

export default function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <MainApp />
      </AuthProvider>
    </ToastProvider>
  );
}
