import React, { useState, useEffect } from 'react';
import Login from './Login';
import Register from './Register';
import DashboardBuku from './DashboardBuku'; 
import DashboardPeminjaman from './DashboardPeminjaman.jsx';
import DashboardStatistik from './DashboardStatistik'; 
import DashboardAnggota from './DashboardAnggota'; 

function App() {
  // Cek apakah di browser sudah ada token aktif, kalau ada langsung masuk dashboard
  const [halaman, setHalaman] = useState(() => {
    return localStorage.getItem('token') ? 'dashboard' : 'login';
  });

  const handleLogout = () => {
    localStorage.removeItem('token');
    setHalaman('login');
  };

  return (
    // 🔮 BACKGROUND UTAMA: Gradasi Deep Space Violet Premium Full Screen
    <div style={{ 
      background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #2e1041 100%)', 
      minHeight: '100vh', 
      paddingTop: '20px', 
      color: 'white',
      fontFamily: "'Segoe UI', Roboto, sans-serif",
      width: '100%',
      boxSizing: 'border-box'
    }}>
      
      {/* 1. JALUR LOGIN */}
      {halaman === 'login' && (
        <Login 
          keHalamanRegister={() => setHalaman('register')} 
          suksesLogin={() => setHalaman('dashboard')} 
        />
      )}

      {/* 2. JALUR REGISTER */}
      {halaman === 'register' && (
        <Register keHalamanLogin={() => setHalaman('login')} />
      )}

      {/* 3. JALUR UTAMA SETELAH LOGIN (NAVIGASI MENU) */}
      {(halaman === 'dashboard' || halaman === 'peminjaman' || halaman === 'statistik' || halaman === 'anggota') && (
        /* 🔥 PERBAIKAN TOTAL: Padding diatur rata '0 24px' di level terluar, width dipaksa penuh 100% */
        <div style={{ 
          padding: '0 24px', 
          width: '100%', 
          boxSizing: 'border-box',
          maxWidth: '100%'
        }}>
          
          {/* BAR NAVBAR ATAS GLASSMORPHISM */}
          <div style={{ 
            display: 'flex', 
            gap: '12px', 
            marginBottom: '20px', 
            backgroundColor: 'rgba(30, 41, 59, 0.45)', 
            padding: '12px 20px', 
            borderRadius: '12px',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            backdropFilter: 'blur(10px)',
            boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.2)',
            flexWrap: 'wrap',
            alignItems: 'center'
          }}>
            <button 
              onClick={() => setHalaman('dashboard')}
              style={{ 
                padding: '10px 20px', 
                background: halaman === 'dashboard' ? '#16a34a' : 'transparent', 
                color: 'white', 
                border: halaman === 'dashboard' ? 'none' : '1px solid rgba(255, 255, 255, 0.2)', 
                borderRadius: '8px', 
                cursor: 'pointer', 
                fontWeight: '600', 
                fontSize: '14px',
                transition: 'all 0.3s'
              }}
            >
              📚 Master Buku
            </button>

            <button 
              onClick={() => setHalaman('peminjaman')}
              style={{ 
                padding: '10px 20px', 
                background: halaman === 'peminjaman' ? '#16a34a' : 'transparent', 
                color: 'white', 
                border: halaman === 'peminjaman' ? 'none' : '1px solid rgba(255, 255, 255, 0.2)', 
                borderRadius: '8px', 
                cursor: 'pointer', 
                fontWeight: '600', 
                fontSize: '14px',
                transition: 'all 0.3s'
              }}
            >
              📊 Log Peminjaman
            </button>

            <button 
              onClick={() => setHalaman('anggota')}
              style={{ 
                padding: '10px 20px', 
                background: halaman === 'anggota' ? '#16a34a' : 'transparent', 
                color: 'white', 
                border: halaman === 'anggota' ? 'none' : '1px solid rgba(255, 255, 255, 0.2)', 
                borderRadius: '8px', 
                cursor: 'pointer', 
                fontWeight: '600', 
                fontSize: '14px',
                transition: 'all 0.3s'
              }}
            >
              👥 Anggota Perpustakaan
            </button>
            
            <button 
              onClick={() => setHalaman('statistik')}
              style={{ 
                padding: '10px 20px', 
                background: halaman === 'statistik' ? '#16a34a' : 'transparent', 
                color: 'white', 
                border: halaman === 'statistik' ? 'none' : '1px solid rgba(255, 255, 255, 0.2)', 
                borderRadius: '8px', 
                cursor: 'pointer', 
                fontWeight: '600', 
                fontSize: '14px',
                transition: 'all 0.3s'
              }}
            >
              📈 Analisis Statistik
            </button>

            <button 
              onClick={handleLogout}
              style={{ 
                padding: '10px 20px', 
                background: 'rgba(239, 68, 68, 0.15)', 
                color: '#f87171', 
                border: '1px solid rgba(239, 68, 68, 0.3)', 
                borderRadius: '8px', 
                cursor: 'pointer', 
                fontWeight: '600', 
                fontSize: '14px',
                marginLeft: 'auto',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => { e.target.style.background = '#dc3545'; e.target.style.color = 'white'; }}
              onMouseLeave={(e) => { e.target.style.background = 'rgba(239, 68, 68, 0.15)'; e.target.style.color = '#f87171'; }}
            >
              Logout
            </button>
          </div>

          {/* 🔥 PERBAIKAN WADAH KONTEN: 
             Sudah dibersihkan dari padding '0 200px' lama, sekarang auto full width mengikuti induknya! */}
          <div style={{ marginTop: '10px', width: '100%' }}>
            {halaman === 'dashboard' && <DashboardBuku logoutSukses={handleLogout} />}
            {halaman === 'peminjaman' && <DashboardPeminjaman />}
            {halaman === 'anggota' && <DashboardAnggota />}
            {halaman === 'statistik' && <DashboardStatistik />}
          </div>
          
        </div>
      )}
    </div>
  );
}

export default App;