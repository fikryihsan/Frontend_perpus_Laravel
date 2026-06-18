import React, { useState, useEffect } from 'react';
import API from './api/api'; // Pastikan path axios instance kamu benar

const DashboardStatistik = () => {
    // --- STATE DATA STATISTIK ---
    const [ringkasan, setRingkasan] = useState(null);
    const [topPeminjam, setTopPeminjam] = useState(null);
    const [topBuku, setTopBuku] = useState(null);
    const [masterBuku, setMasterBuku] = useState([]); // 🔥 TAMBAHAN: Untuk mencocokkan ID Buku ke Judul

    // --- STATE UI ---
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        loadSemuaStatistik();
    }, []);

    const loadSemuaStatistik = async () => {
        setLoading(true);
        setError('');
        try {
            // Jalankan semua API secara bersamaan biar cepat, termasuk ambil data master buku
            const [resRingkasan, resPeminjam, resBuku, resMasterBuku] = await Promise.all([
                API.get('/statistik'),
                API.get('/statistik/peminjam-terbanyak'),
                API.get('/statistik/buku-terbanyak'),
                API.get('/buku') // 🔥 Ambil daftar buku asli untuk dapetin judulnya
            ]);

            setRingkasan(resRingkasan.data);
            setTopPeminjam(resPeminjam.data?.data || resPeminjam.data);
            setTopBuku(resBuku.data?.data || resBuku.data);
            setMasterBuku(resMasterBuku.data); // Simpan daftar buku ke state

        } catch (err) {
            console.error("Gagal memuat data statistik:", err);
            if (err.response && err.response.status === 401) {
                setError('Sesi login habis. Silakan logout lalu login kembali, geng!');
            } else {
                setError('Gagal mengambil data statistik dari server Laravel.');
            }
        } finally {
            setLoading(false);
        }
    };

    // LOGIKA COCOKAN JUDUL BUKU TERLARIS SECARA LIVE
    let judulBukuTerlaris = "Judul Tidak Diketahui";
    if (topBuku && topBuku.id_buku) {
        const bukuCocok = masterBuku.find(b => String(b.id_buku) === String(topBuku.id_buku));
        if (bukuCocok) {
            judulBukuTerlaris = bukuCocok.judul;
        } else if (topBuku.judul) {
            judulBukuTerlaris = topBuku.judul; // Antisipasi kalau API-nya ngirim properti judul langsung
        }
    }

    if (loading) {
        return (
            <div style={{ 
                display: 'flex', 
                justifyContent: 'center', 
                alignItems: 'center', 
                height: '60vh', 
                color: 'white', 
                fontFamily: "'Segoe UI', Roboto, Helvetica, Arial, sans-serif" 
            }}>
                <div style={{ textAlign: 'center' }}>
                    <h3 style={{ fontWeight: '600', animation: 'pulse 1.5s infinite alternate', color: '#38bdf8' }}>
                        ⏳ Memuat Data Analisis Statistik Perpustakaan...
                    </h3>
                    <p style={{ color: '#64748b', fontSize: '13px' }}>Menghubungkan ke core engine server Laravel...</p>
                </div>
            </div>
        );
    }

    return (
        <div style={{ 
            fontFamily: "'Segoe UI', Roboto, Helvetica, Arial, sans-serif", 
            color: 'white', 
            padding: '10px 5px' 
        }}>
            
            {/* HEADER DASHBOARD */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px', borderBottom: '1px solid rgba(255, 255, 255, 0.1)', paddingBottom: '15px', flexWrap: 'wrap', gap: '15px' }}>
                <div>
                    <h2 style={{ margin: 0, fontWeight: '700', fontSize: '24px', letterSpacing: '0.5px' }}>
                        📈 Panel Analisis & Statistik Perpustakaan
                    </h2>
                    <p style={{ margin: '4px 0 0 0', color: '#94a3b8', fontSize: '13px' }}>Metrik performa, laporan sirkulasi data, dan pencapaian rekor aktual</p>
                </div>
                <button 
                    onClick={loadSemuaStatistik}
                    style={{ 
                        padding: '10px 20px', 
                        background: '#16a34a', 
                        color: 'white', 
                        border: 'none', 
                        borderRadius: '8px', 
                        cursor: 'pointer', 
                        fontWeight: '600', 
                        fontSize: '13px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        boxShadow: '0 4px 12px rgba(22, 163, 74, 0.25)',
                        transition: 'all 0.3s'
                    }}
                    onMouseEnter={(e) => e.target.style.background = '#15803d'}
                    onMouseLeave={(e) => e.target.style.background = '#16a34a'}
                >
                    Refresh Data Analisis
                </button>
            </div>

            {/* NOTIFIKASI ERROR JIKA TOKEN ATAU NETWORK TIMEOUT */}
            {error && (
                <div style={{ backgroundColor: 'rgba(239, 68, 68, 0.15)', color: '#f87171', padding: '12px 16px', borderRadius: '8px', fontSize: '14px', marginBottom: '25px', border: '1px solid rgba(239, 68, 68, 0.3)', fontWeight: '500' }}>
                    🔴 {error}
                </div>
            )}

            {/* ================= BARIS 1: KOTAK INFORMASI RINGKASAN DATA (METRIKS GLASSMORPHISM) ================= */}
            <div style={{ marginBottom: '15px' }}>
                <h3 style={{ margin: '0 0 15px 0', fontSize: '16px', fontWeight: '600', color: '#cbd5e1', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    📋 Ringkasan Umum Sirkulasi
                </h3>
            </div>
            
            <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', marginBottom: '40px' }}>
                
                {/* Card 1: Total Transaksi */}
                <div style={{ 
                    flex: '1', 
                    minWidth: '220px', 
                    backgroundColor: 'rgba(30, 41, 59, 0.4)', 
                    padding: '24px 20px', 
                    borderRadius: '16px', 
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    backdropFilter: 'blur(10px)',
                    textAlign: 'center',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.15)'
                }}>
                    <p style={{ margin: 0, color: '#94a3b8', fontSize: '12px', fontWeight: '700', letterSpacing: '1px' }}>TOTAL TRANSAKSI</p>
                    <h1 style={{ margin: '12px 0 0 0', color: '#38bdf8', fontSize: '38px', fontWeight: '800' }}>
                        {ringkasan?.total_transaksi ?? '0'} <span style={{ fontSize: '14px', color: '#64748b', fontWeight: '500' }}>Data</span>
                    </h1>
                </div>

                {/* Card 2: Sedang Dipinjam */}
                <div style={{ 
                    flex: '1', 
                    minWidth: '220px', 
                    backgroundColor: 'rgba(30, 41, 59, 0.4)', 
                    padding: '24px 20px', 
                    borderRadius: '16px', 
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    backdropFilter: 'blur(10px)',
                    textAlign: 'center',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.15)'
                }}>
                    <p style={{ margin: 0, color: '#94a3b8', fontSize: '12px', fontWeight: '700', letterSpacing: '1px' }}>SEDANG DIPINJAM SISWA</p>
                    <h1 style={{ margin: '12px 0 0 0', color: '#f59e0b', fontSize: '38px', fontWeight: '800' }}>
                        {ringkasan?.sedang_dipinjam ?? '0'} <span style={{ fontSize: '14px', color: '#64748b', fontWeight: '500' }}>Buku</span>
                    </h1>
                </div>

                {/* Card 3: Sudah Kembali */}
                <div style={{ 
                    flex: '1', 
                    minWidth: '220px', 
                    backgroundColor: 'rgba(30, 41, 59, 0.4)', 
                    padding: '24px 20px', 
                    borderRadius: '16px', 
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    backdropFilter: 'blur(10px)',
                    textAlign: 'center',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.15)'
                }}>
                    <p style={{ margin: 0, color: '#94a3b8', fontSize: '12px', fontWeight: '700', letterSpacing: '1px' }}>SUDAH DIKEMBALIKAN</p>
                    <h1 style={{ margin: '12px 0 0 0', color: '#4ade80', fontSize: '38px', fontWeight: '800' }}>
                        {ringkasan?.sudah_kembali ?? '0'} <span style={{ fontSize: '14px', color: '#64748b', fontWeight: '500' }}>Buku</span>
                    </h1>
                </div>
            </div>

            {/* ================= BARIS 2: REKOR & PRESTASI BULAN INI (CARDS SPLIT) ================= */}
            <div style={{ marginBottom: '15px' }}>
                <h3 style={{ margin: '0 0 15px 0', fontSize: '16px', fontWeight: '600', color: '#cbd5e1', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    🏆 Rekor Transaksi Bulan Ini
                </h3>
            </div>

            <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
                
                {/* Box Sisi Kiri: Peminjam Terbanyak */}
                <div style={{ 
                    flex: '1', 
                    minWidth: '300px', 
                    backgroundColor: 'rgba(30, 41, 59, 0.4)', 
                    padding: '25px', 
                    borderRadius: '16px', 
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    backdropFilter: 'blur(10px)',
                    boxShadow: '0 10px 30px rgba(0,0,0,0.15)'
                }}>
                    <h4 style={{ margin: '0 0 20px 0', color: '#f59e0b', fontSize: '15px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '8px', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '10px' }}>
                        🥇 Siswa Teraktif Bulan Ini
                    </h4>
                    {topPeminjam ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            <div>
                                <span style={{ color: '#64748b', fontSize: '12px', display: 'block', fontWeight: '600' }}>IDENTITAS SISWA</span>
                                <strong style={{ color: '#f1f5f9', fontSize: '18px', fontWeight: '700' }}>
                                    ID Anggota #{topPeminjam.id_anggota}
                                </strong>
                            </div>
                            <div style={{ marginTop: '5px' }}>
                                <span style={{ color: '#64748b', fontSize: '12px', display: 'block', fontWeight: '600' }}>INTENSITAS LITERASI</span>
                                <span style={{ color: '#4ade80', fontSize: '15px', fontWeight: '600' }}>
                                    {topPeminjam.total_buku_sebulan ?? topPeminjam.total_buku_dipinjam ?? '0'} Buku Fisik Dibaca
                                </span>
                            </div>
                        </div>
                    ) : (
                        <p style={{ color: '#64748b', margin: 0, fontSize: '13px' }}>📭 Belum ada rekor peminjaman siswa bulan ini.</p>
                    )}
                </div>

                {/* Box Sisi Kanan: Buku Terpopuler */}
                <div style={{ 
                    flex: '1', 
                    minWidth: '300px', 
                    backgroundColor: 'rgba(30, 41, 59, 0.4)', 
                    padding: '25px', 
                    borderRadius: '16px', 
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    backdropFilter: 'blur(10px)',
                    boxShadow: '0 10px 30px rgba(0,0,0,0.15)'
                }}>
                    <h4 style={{ margin: '0 0 20px 0', color: '#38bdf8', fontSize: '15px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '8px', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '10px' }}>
                        🔥 Buku Terlaris (Best Seller)
                    </h4>
                    {topBuku ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            <div>
                                <span style={{ color: '#64748b', fontSize: '12px', display: 'block', fontWeight: '600' }}>JUDUL BUKU UTAMA</span>
                                <h4 style={{ margin: '2px 0 0 0', color: '#38bdf8', fontSize: '17px', fontWeight: '700', lineHeight: '1.4' }}>
                                    {judulBukuTerlaris}
                                </h4>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '5px', gap: '15px' }}>
                                <div>
                                    <span style={{ color: '#64748b', fontSize: '12px', display: 'block', fontWeight: '600' }}>INDEX DATABASE</span>
                                    <span style={{ color: '#cbd5e1', fontSize: '13px', fontWeight: '500' }}>ID Buku: {topBuku.id_buku}</span>
                                </div>
                                <div style={{ textAlign: 'right' }}>
                                    <span style={{ color: '#64748b', fontSize: '12px', display: 'block', fontWeight: '600' }}>AKUMULASI PINJAM</span>
                                    <strong style={{ color: '#f59e0b', fontSize: '15px', fontWeight: '700' }}>
                                        {topBuku.total_dipinjam ?? topBuku.total_kali_dipinjam ?? '0'} Kali
                                    </strong>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <p style={{ color: '#64748b', margin: 0, fontSize: '13px' }}>📭 Belum ada data buku terpopuler bulan ini.</p>
                    )}
                </div>

            </div>
        </div>
    );
};

export default DashboardStatistik;