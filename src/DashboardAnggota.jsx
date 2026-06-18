import React, { useState, useEffect } from 'react';
import API from './api/api';

const DashboardAnggota = () => {
    const [daftarAnggota, setDaftarAnggota] = useState([]);
    const [keywordCari, setKeywordCari] = useState('');
    const [nama, setNama] = useState('');
    const [email, setEmail] = useState('');

    const [pesanSukses, setPesanSukses] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [isSearching, setIsSearching] = useState(false);

    const [tampilkanForm, setTampilkanForm] = useState(false);

    useEffect(() => {
        ambilSemuaAnggota();
    }, []);

    const ambilSemuaAnggota = async () => {
        setLoading(true);
        setError('');
        try {
            const response = await API.get('/anggota');
            setDaftarAnggota(response.data);
            setIsSearching(false);
        } catch (err) {
            console.error(err);
            if (err.response && err.response.status === 401) {
                setError('Sesi login kamu habis. Silakan logout lalu login kembali ya!');
            } else {
                setError('Gagal mengambil data anggota dari server Laravel.');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleTambahAnggota = async (e) => {
        e.preventDefault();
        setError('');
        setPesanSukses('');

        if (!nama || !email) {
            setError('Kolom Nama Lengkap dan Email wajib diisi, geng!');
            return;
        }

        setLoading(true);
        try {
            const response = await API.post('/anggota', { nama, email });
            setPesanSukses(response.data.message || 'Anggota baru berhasil didaftarkan!');
            setNama('');
            setEmail('');
            setTampilkanForm(false); // 🔥 Otomatis tutup form pop-up setelah sukses simpan
            ambilSemuaAnggota();
        } catch (err) {
            console.error("Gagal tambah anggota:", err.response);
            setError(err.response?.data?.message || 'Gagal mendaftarkan anggota baru.');
        } finally {
            setLoading(false);
        }
    };

    const handleCariAnggota = async (e) => {
        e.preventDefault();
        setError('');
        setPesanSukses('');

        if (!keywordCari.trim()) {
            resetPencarian();
            return;
        }

        // 🔥 SET TRUE DI AWAL: Agar tombol reset selalu tampil walau hasil pencariannya nanti error/salah ketik
        setIsSearching(true);
        setLoading(true);
        
        try {
            const response = await API.get(`/anggota?search=${keywordCari}`);
            setDaftarAnggota(response.data);
        } catch (err) {
            console.error(err);
            if (err.response && err.response.status === 404) {
                setError(`Data anggota dengan kata kunci "${keywordCari}" tidak ditemukan.`);
            } else {
                setError('Terjadi kesalahan atau data anggota tidak ditemukan.');
            }
            setDaftarAnggota([]);
        } finally {
            setLoading(false);
        }
    };

    const resetPencarian = () => {
        setKeywordCari('');
        setIsSearching(false);
        setError(''); // Bersihkan pesan error pencarian sebelumnya agar tampilan bersih kembali
        ambilSemuaAnggota();
    };

    return (
        <div style={{ 
            fontFamily: "'Segoe UI', Roboto, Helvetica, Arial, sans-serif", 
            color: 'white', 
            padding: '10px 5px' 
        }}>
            {/* HEADER JUDUL */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px', borderBottom: '1px solid rgba(255, 255, 255, 0.1)', paddingBottom: '15px' }}>
                <div>
                    <h2 style={{ margin: 0, fontWeight: '700', fontSize: '24px', letterSpacing: '0.5px' }}>
                        👥 Modul Data Anggota Perpustakaan
                    </h2>
                    <p style={{ margin: '4px 0 0 0', color: '#94a3b8', fontSize: '13px' }}>Kelola dan daftarkan keanggotaan aktif siswa dengan mudah</p>
                </div>
            </div>

            {/* NOTIFIKASI ALERT */}
            {pesanSukses && (
                <div style={{ backgroundColor: 'rgba(34, 197, 94, 0.15)', color: '#4ade80', padding: '12px 16px', borderRadius: '8px', fontSize: '14px', marginBottom: '20px', border: '1px solid rgba(34, 197, 94, 0.3)', fontWeight: '500' }}>
                    🟢 {pesanSukses}
                </div>
            )}
            {error && (
                <div style={{ backgroundColor: 'rgba(239, 68, 68, 0.15)', color: '#f87171', padding: '12px 16px', borderRadius: '8px', fontSize: '14px', marginBottom: '20px', border: '1px solid rgba(239, 68, 68, 0.3)', fontWeight: '500' }}>
                    🔴 {error}
                </div>
            )}

            {/* BAR MENU ATAS TABEL: UNTUK TOMBOL TAMBAH DATA DAN SEARCH BAR */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '20px', marginBottom: '25px', flexWrap: 'wrap' }}>
                
                {/* TOMBOL UTAMA UNTUK MENGAKTIFKAN MODAL FORM */}
                <button 
                    onClick={() => setTampilkanForm(true)}
                    style={{ 
                        padding: '12px 24px', 
                        background: '#16a34a', 
                        color: 'white', 
                        border: 'none', 
                        borderRadius: '8px', 
                        cursor: 'pointer', 
                        fontWeight: '600', 
                        fontSize: '14px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        boxShadow: '0 4px 12px rgba(22, 163, 74, 0.25)',
                        transition: 'all 0.3s ease'
                    }}
                    onMouseEnter={(e) => e.target.style.background = '#15803d'}
                    onMouseLeave={(e) => e.target.style.background = '#16a34a'}
                >
                Tambah Anggota Baru
                </button>

                {/* SEARCH BAR (Lebih Pas di Kanan) */}
                <div style={{ flex: '1', maxWidth: '500px' }}>
                    <form onSubmit={handleCariAnggota} style={{ display: 'flex', gap: '10px' }}>
                        <input 
                            type="text" 
                            placeholder="Cari Anggota berdasarkan ID atau Nama Lengkap..." 
                            value={keywordCari}
                            onChange={(e) => setKeywordCari(e.target.value)}
                            style={{ flex: '1', padding: '11px 16px', borderRadius: '8px', backgroundColor: 'rgba(15, 23, 42, 0.6)', color: 'white', border: '1px solid rgba(255,255,255,0.15)', outline: 'none', fontSize: '14px', transition: 'all 0.3s' }}
                            onFocus={(e) => e.target.style.borderColor = '#38bdf8'}
                            onBlur={(e) => e.target.style.borderColor = 'rgba(255,255,255,0.15)'}
                        />
                        <button type="submit" style={{ padding: '11px 22px', background: '#0284c7', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '14px', boxShadow: '0 4px 12px rgba(2, 132, 199, 0.25)' }}>
                            Cari
                        </button>
                        
                        {/* 🔥 PERBAIKAN: Tombol reset dipastikan selalu muncul jika isSearching bernilai true */}
                        {isSearching && (
                            <button 
                                type="button" 
                                onClick={resetPencarian} 
                                style={{ padding: '11px 16px', background: '#475569', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '14px', fontWeight: '600', transition: 'all 0.2s' }}
                                onMouseEnter={(e) => e.target.style.background = '#334155'}
                                onMouseLeave={(e) => e.target.style.background = '#475569'}
                            >
                                Reset
                            </button>
                        )}
                    </form>
                </div>
            </div>

            {/* TABEL FULL WIDTH GLASSMORPHISM */}
            <div style={{ 
                backgroundColor: 'rgba(30, 41, 59, 0.4)', 
                padding: '10px', 
                borderRadius: '16px', 
                border: '1px solid rgba(255, 255, 255, 0.08)',
                backdropFilter: 'blur(10px)',
                overflowX: 'auto'
            }}>
                <h3 style={{ margin: '15px 12px 10px 12px', fontSize: '16px', fontWeight: '600', color: '#cbd5e1' }}>Daftar Seluruh Anggota Aktif</h3>
                
                {loading && <p style={{ color: '#38bdf8', fontWeight: '600', margin: '15px 12px', fontSize: '14px' }}>Memproses data...</p>}
                
                {!loading && (
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px', marginTop: '10px' }}>
                        <thead>
                            <tr style={{ borderBottom: '2px solid rgba(255, 255, 255, 0.1)', textAlign: 'left', color: '#94a3b8' }}>
                                <th style={{ padding: '16px 12px', fontWeight: '600', width: '40px', textAlign: 'center' }}>No</th>
                                <th style={{ padding: '16px 12px', fontWeight: '600', width: '120px' }}>ID Anggota</th>
                                <th style={{ padding: '16px 12px', fontWeight: '600' }}>Nama Lengkap</th>
                                <th style={{ padding: '16px 12px', fontWeight: '600' }}>Email</th>
                                <th style={{ padding: '16px 12px', fontWeight: '600', width: '100px', textAlign: 'center' }}>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {daftarAnggota.length > 0 ? (
                                daftarAnggota.map((mhs, index) => (
                                    <tr 
                                        key={mhs.id_anggota} 
                                        style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.05)', transition: 'background-color 0.2s' }}
                                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.03)'}
                                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                                    >
                                        <td style={{ padding: '14px 12px', textAlign: 'center', color: '#64748b' }}>{index + 1}</td>
                                        <td style={{ padding: '14px 12px', fontWeight: '700', color: '#f59e0b' }}>#{mhs.id_anggota}</td>
                                        <td style={{ padding: '14px 12px', fontWeight: '500', color: '#f1f5f9' }}>{mhs.nama}</td>
                                        <td style={{ padding: '14px 12px', color: '#cbd5e1' }}>{mhs.email || '-'}</td>
                                        <td style={{ padding: '14px 12px', textAlign: 'center' }}>
                                            <span style={{ 
                                                padding: '4px 10px', 
                                                borderRadius: '6px', 
                                                fontSize: '11px', 
                                                fontWeight: 'bold', 
                                                backgroundColor: 'rgba(34, 197, 94, 0.15)', 
                                                color: '#4ade80',
                                                border: '1px solid rgba(34, 197, 94, 0.3)'
                                            }}>
                                                AKTIF
                                            </span>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="5" style={{ padding: '30px', textAlign: 'center', color: '#64748b', fontSize: '14px' }}>Data anggota tidak ditemukan.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                )}
            </div>

            {/* TAMPILAN POP-UP MODAL FORM GLASSMORPHISM */}
            {tampilkanForm && (
    <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: 'rgba(15, 23, 42, 0.75)', backdropFilter: 'blur(8px)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
        <div style={{ backgroundColor: 'rgba(30, 41, 59, 0.9)', padding: '30px', borderRadius: '16px', border: '1px solid rgba(255, 255, 255, 0.15)', width: '100%', maxWidth: '450px', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)', position: 'relative', boxSizing: 'border-box' }}>
            
            {/* 🔥 PERBAIKAN DI SINI: Ditambah justifyContent 'center' & posisi tombol silang dibuat absolute agar judul presisi di tengah */}
            <div style={{ 
                display: 'flex', 
                justifyContent: 'center', 
                alignItems: 'center', 
                borderBottom: '2px solid #16a34a', 
                paddingBottom: '12px', 
                marginBottom: '20px',
                position: 'relative' // Menjadi patokan posisi tombol silang
            }}>
                <h3 style={{ margin: 0, fontWeight: '700', fontSize: '18px', color: '#4ade80', textAlign: 'center' }}>
                Pendaftaran Anggota Baru
                </h3>
                
                <button 
                    type="button"
                    onClick={() => setTampilkanForm(false)} 
                    style={{ 
                        position: 'absolute', // Membuat tombol silang melayang di kanan tanpa mendorong judul
                        right: '0px', 
                        background: 'none', 
                        border: 'none', 
                        color: '#94a3b8', 
                        fontSize: '18px', 
                        cursor: 'pointer', 
                        fontWeight: 'bold', 
                        padding: '5px', 
                        transition: 'color 0.2s' 
                    }}
                    onMouseEnter={(e) => e.target.style.color = '#f87171'}
                    onMouseLeave={(e) => e.target.style.color = '#94a3b8'}
                >
                    ✕
                </button>
            </div>

                        <form onSubmit={handleTambahAnggota} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
                            <div>
                                <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '600', color: '#cbd5e1' }}>Nama Lengkap Siswa:</label>
                                <input 
                                    type="text" 
                                    placeholder="Masukkan nama lengkap siswa..." 
                                    value={nama} 
                                    onChange={(e) => setNama(e.target.value)} 
                                    style={{ width: '100%', padding: '11px 14px', borderRadius: '8px', backgroundColor: 'rgba(15, 23, 42, 0.6)', color: 'white', border: '1px solid rgba(255,255,255,0.15)', boxSizing: 'border-box', outline: 'none', fontSize: '14px' }} 
                                />
                            </div>
                            <div>
                                <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '600', color: '#cbd5e1' }}>Alamat Email Aktif:</label>
                                <input 
                                    type="email" 
                                    placeholder="Contoh: siswa@mail.com" 
                                    value={email} 
                                    onChange={(e) => setEmail(e.target.value)} 
                                    style={{ width: '100%', padding: '11px 14px', borderRadius: '8px', backgroundColor: 'rgba(15, 23, 42, 0.6)', color: 'white', border: '1px solid rgba(255,255,255,0.15)', boxSizing: 'border-box', outline: 'none', fontSize: '14px' }} 
                                />
                            </div>
                            <div style={{ display: 'flex', gap: '12px', marginTop: '10px' }}>
                                <button type="button" onClick={() => setTampilkanForm(false)} style={{ flex: 1, padding: '11px', background: '#475569', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '14px' }}>
                                    Batal
                                </button>
                                <button type="submit" style={{ flex: 2, padding: '11px', background: '#16a34a', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '14px', boxShadow: '0 4px 12px rgba(22, 163, 74, 0.2)' }}>
                                    Simpan Anggota
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DashboardAnggota;