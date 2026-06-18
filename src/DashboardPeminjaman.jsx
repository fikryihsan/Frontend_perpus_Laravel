import React, { useState, useEffect } from 'react';
import API from './api/api'; // Pastikan path axios instance kamu sudah benar

const DashboardPeminjaman = () => {
    // --- STATE FORM TRANSAKSI ---
    const [idAnggota, setIdAnggota] = useState('1'); // Default 1 sesuai data di database kamu
    const [idBuku, setIdBuku] = useState(''); // ID Buku asli database yang mau dipinjam
    const [tglPinjam, setTglPinjam] = useState(new Date().toISOString().split('T')[0]); // Default tanggal hari ini
    const [tglKembali, setTglKembali] = useState('');

    // --- STATE DATA & UI ---
    const [daftarPeminjaman, setDaftarPeminjaman] = useState([]);
    const [pesanSukses, setPesanSukses] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [masterBuku, setMasterBuku] = useState([]); // Untuk menyimpan daftar judul buku dari API master

    // --- STATE BARU UNTUK FITUR PENCARIAN ID ---
    const [idCariPinjam, setIdCariPinjam] = useState(''); // Menampung input angka ID Pinjam dari user
    const [isSearchingPinjam, setIsSearchingPinjam] = useState(false); // Penanda sedang dalam mode pencarian

    // --- STATE POP-UP (MODAL) ---
    const [tampilkanForm, setTampilkanForm] = useState(false); 

    // 🔥 STATE BARU: Menyimpan data objek transaksi yang mau dihapus untuk memicu pop-up custom di tengah
    const [transaksiMauDihapus, setTransaksiMauDihapus] = useState(null);

    // Ambil data peminjaman saat komponen pertama kali dimuat
    useEffect(() => {
        ambilDataPeminjaman();
        ambilMasterBuku(); // Jalankan ini juga saat halaman dibuka
    }, []);

    // Fungsi mengambil semua list buku untuk mencocokkan ID dan Judul di Frontend
    const ambilMasterBuku = async () => {
        try {
            const response = await API.get('/buku');
            // Menangani jika data berwujud response.data.data atau response.data langsung
            const dataBuku = response.data?.data || response.data;
            setMasterBuku(Array.isArray(dataBuku) ? dataBuku : []);
        } catch (err) {
            console.error("Gagal ambil master buku:", err);
        }
    };

    // Fungsi Ambil Semua Data Peminjaman
    const ambilDataPeminjaman = async () => {
        try {
            const response = await API.get('/peminjaman');
            const dataPeminjaman = response.data?.data || response.data;
            setDaftarPeminjaman(Array.isArray(dataPeminjaman) ? dataPeminjaman : []);
        } catch (err) {
            console.error(err);
            if (err.response && err.response.status === 401) {
                setError('Sesi login kamu sudah habis (Token Expired). Silakan klik tombol Logout di atas lalu login kembali ya!');
            } else {
                setError('Gagal mengambil data peminjaman dari server.');
            }
        }
    };

    // Fitur Tambahan: Cari Transaksi Peminjaman Berdasarkan ID PINJAM
    const handleCariPeminjaman = async (e) => {
        e.preventDefault();
        setError('');
        setPesanSukses('');

        if (!idCariPinjam) {
            setIsSearchingPinjam(false);
            ambilDataPeminjaman();
            return;
        }

        // 🔥 SET TRUE DI AWAL: Supaya tombol reset langsung nongol apa pun hasil pencariannya (berhasil/salah)
        setIsSearchingPinjam(true);

        try {
            const response = await API.get(`/peminjaman/${idCariPinjam}`);
            const dataHasil = response.data?.data || response.data;
            if (dataHasil) {
                setDaftarPeminjaman([dataHasil]); // Bungkus ke dalam array agar tidak crash saat di-.map()
            } else {
                setError('Transaksi peminjaman tidak ditemukan.');
                setDaftarPeminjaman([]);
            }
        } catch (err) {
            console.error(err);
            setError('ID Transaksi tidak ditemukan atau salah, geng!');
            setDaftarPeminjaman([]);
        }
    };

    // Fungsi untuk membatalkan mode pencarian
    const resetPencarianPinjam = () => {
        setIdCariPinjam('');
        setIsSearchingPinjam(false);
        setError(''); // Bersihkan juga pesan error salah cari biar rapi
        ambilDataPeminjaman();
    };

    // Fungsi Tambah Transaksi Peminjaman (Two-Step Insert)
    const handleSimpanPeminjaman = async (e) => {
        e.preventDefault();
        setError('');
        setPesanSukses('');

        if (!idBuku || !tglKembali) {
            setError('ID Buku dan Tanggal Kembali wajib diisi, geng!');
            return;
        }

        setLoading(true);

        try {
            const payloadInduk = {
                id_anggota: parseInt(idAnggota),
                tgl_pinjam: tglPinjam,
                tgl_kembali: tglKembali,
                status: 'dipinjam'
            };

            const responseInduk = await API.post('/peminjaman', payloadInduk);
            // Ambil ID Pinjam Baru dari response data
            const idPinjamBaru = responseInduk.data?.id_pinjam || responseInduk.data?.data?.id_pinjam;

            if (!idPinjamBaru) {
                throw new Error('Gagal mendapatkan ID Peminjaman dari server.');
            }

            const payloadDetail = {
                id_buku: parseInt(idBuku)
            };

            await API.post(`/peminjaman/${idPinjamBaru}/detail`, payloadDetail);

            // Simpan ID buku secara lokal agar frontend pintar mencocokkan judulnya langsung
            localStorage.setItem(`buku_pinjam_${idPinjamBaru}`, idBuku);

            setPesanSukses(`Transaksi peminjaman ID #${idPinjamBaru} berhasil dibuat!`);
            setIdBuku('');
            setTglKembali(''); 
            setTampilkanForm(false); // Otomatis tutup pop-up kalau sukses
            ambilDataPeminjaman();

        } catch (err) {
            console.error(err);
            setError(err.response?.data?.message || 'Gagal menyimpan transaksi. Pastikan ID Buku benar dan stok ada.');
        } finally {
            setLoading(false);
        }
    };

    // Fungsi Mengembalikan Buku
    const handleKembalikanBuku = async (idPinjam) => {
        setError('');
        setPesanSukses('');
        const tglHariIni = new Date().toISOString().split('T')[0];

        try {
            const payloadUpdate = {
                _method: 'PUT',
                status: 'kembali',
                tgl_kembali: tglHariIni
            };

            await API.post(`/peminjaman/${idPinjam}`, payloadUpdate);
            setPesanSukses(`Buku pada transaksi #${idPinjam} berhasil dikembalikan!`);
            ambilDataPeminjaman();
        } catch (err) {
            console.error(err);
            setError('Gagal memproses pengembalian buku.');
        }
    };

    // 🔥 LOGIC BARU: Eksekusi hapus yang dipanggil dari dalam Modal Custom Tengah
    const eksekusiHapusPeminjaman = async () => {
        if (!transaksiMauDihapus) return;

        setError('');
        setPesanSukses('');

        try {
            await API.delete(`/peminjaman/${transaksiMauDihapus.id_pinjam}`);
            setPesanSukses(`Transaksi #${transaksiMauDihapus.id_pinjam} berhasil dihapus dari database.`);
            setTransaksiMauDihapus(null); // Tutup modal setelah sukses
            ambilDataPeminjaman();
        } catch (err) {
            console.error(err);
            setTransaksiMauDihapus(null); // Tutup modal sebelum cetak error
            setError('Gagal menghapus data transaksi.');
        }
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
                        📊 Modul Transaksi Peminjaman
                    </h2>
                    <p style={{ margin: '4px 0 0 0', color: '#94a3b8', fontSize: '13px' }}>Catat dan pantau sirkulasi peminjaman buku perpustakaan</p>
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

            {/* BAR ATAS: TOMBOL POPUP & FORM PENCARIAN */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '20px', marginBottom: '25px', flexWrap: 'wrap' }}>
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
                 Buat Peminjaman Baru
                </button>

                <form onSubmit={handleCariPeminjaman} style={{ display: 'flex', gap: '10px', flex: 1, maxWidth: '500px' }}>
                    <input 
                        type="number" 
                        placeholder="Cari Nomor ID Pinjam (Contoh: 1)..." 
                        value={idCariPinjam}
                        onChange={(e) => setIdCariPinjam(e.target.value)}
                        style={{ flex: '1', padding: '11px 16px', borderRadius: '8px', backgroundColor: 'rgba(15, 23, 42, 0.6)', color: 'white', border: '1px solid rgba(255,255,255,0.15)', outline: 'none', fontSize: '14px', transition: 'all 0.3s' }}
                        onFocus={(e) => e.target.style.borderColor = '#38bdf8'}
                        onBlur={(e) => e.target.style.borderColor = 'rgba(255,255,255,0.15)'}
                    />
                    <button type="submit" style={{ padding: '11px 22px', background: '#0284c7', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '14px', boxShadow: '0 4px 12px rgba(2, 132, 199, 0.25)' }}>
                        Cari 
                    </button>
                    
                    {/* 🔥 PERBAIKAN: Tombol reset dipastikan selalu muncul jika isSearchingPinjam bernilai true */}
                    {isSearchingPinjam && (
                        <button 
                            type="button" 
                            onClick={resetPencarianPinjam} 
                            style={{ padding: '11px 16px', background: '#475569', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '14px', fontWeight: '600', transition: 'all 0.2s' }}
                            onMouseEnter={(e) => e.target.style.background = '#334155'}
                            onMouseLeave={(e) => e.target.style.background = '#475569'}
                        >
                            Reset
                        </button>
                    )}
                </form>
            </div>

            {/* ================= TABEL RIWAYAT TRANSAKSI GLASSMORPHISM ================= */}
            <div style={{ 
                backgroundColor: 'rgba(30, 41, 59, 0.4)', 
                padding: '10px', 
                borderRadius: '16px', 
                border: '1px solid rgba(255, 255, 255, 0.08)',
                backdropFilter: 'blur(10px)',
                overflowX: 'auto'
            }}>
                <h3 style={{ margin: '15px 12px 10px 12px', fontSize: '16px', fontWeight: '600', color: '#cbd5e1' }}>Riwayat & Status Peminjaman</h3>
                
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px', marginTop: '10px' }}>
                    <thead>
                        <tr style={{ borderBottom: '2px solid rgba(255, 255, 255, 0.1)', textAlign: 'left', color: '#94a3b8' }}>
                            <th style={{ padding: '16px 12px', fontWeight: '600', width: '40px', textAlign: 'center' }}>No</th>
                            <th style={{ padding: '16px 12px', fontWeight: '600', width: '90px' }}>ID Pinjam</th>
                            <th style={{ padding: '16px 12px', fontWeight: '600', width: '80px', textAlign: 'center' }}>ID Siswa</th>
                            <th style={{ padding: '16px 12px', fontWeight: '600' }}>Buku Yang Dipinjam</th>
                            <th style={{ padding: '16px 12px', fontWeight: '600', width: '110px' }}>Tgl Pinjam</th>
                            <th style={{ padding: '16px 12px', fontWeight: '600', width: '110px' }}>Tgl Kembali</th>
                            <th style={{ padding: '16px 12px', fontWeight: '600', textAlign: 'center', width: '100px' }}>Status</th>
                            <th style={{ padding: '16px 12px', fontWeight: '600', textAlign: 'center', width: '160px' }}>Aksi</th>
                        </tr>
                    </thead>
                    <tbody>
                        {daftarPeminjaman.length > 0 ? (
                            daftarPeminjaman.map((pinjam, index) => {
                                const savedIdBuku = localStorage.getItem(`buku_pinjam_${pinjam.id_pinjam}`);
                                let infoBuku = "-";
                                
                                if (savedIdBuku) {
                                    const bukuCocok = masterBuku && masterBuku.length > 0 
                                        ? masterBuku.find(b => String(b.id_buku) === String(savedIdBuku)) 
                                        : null;

                                    if (bukuCocok) {
                                        infoBuku = `[ID: ${savedIdBuku}] ${bukuCocok.judul}`;
                                    } else {
                                        infoBuku = `ID Buku: ${savedIdBuku}`;
                                    }
                                } else {
                                    infoBuku = `ID Buku Terikat #${pinjam.id_pinjam}`;
                                }

                                return (
                                    <tr 
                                        key={pinjam.id_pinjam} 
                                        style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.05)', transition: 'background-color 0.2s' }}
                                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.03)'}
                                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                                    >
                                        <td style={{ padding: '14px 12px', textAlign: 'center', color: '#64748b' }}>{index + 1}</td>
                                        <td style={{ padding: '14px 12px', fontWeight: '700', color: '#38bdf8' }}>#{pinjam.id_pinjam}</td>
                                        <td style={{ padding: '14px 12px', textAlign: 'center', color: '#f1f5f9' }}>{pinjam.id_anggota}</td>
                                        <td style={{ padding: '14px 12px', fontWeight: '500', color: '#f59e0b' }}>{infoBuku}</td>
                                        <td style={{ padding: '14px 12px', color: '#cbd5e1' }}>{pinjam.tgl_pinjam}</td>
                                        <td style={{ padding: '14px 12px', color: '#cbd5e1' }}>{pinjam.tgl_kembali || '-'}</td>
                                        <td style={{ padding: '14px 12px', textAlign: 'center' }}>
                                            <span style={{ 
                                                padding: '4px 10px', 
                                                borderRadius: '6px', 
                                                fontSize: '11px', 
                                                fontWeight: 'bold',
                                                backgroundColor: pinjam.status === 'dipinjam' ? 'rgba(249, 115, 22, 0.15)' : 'rgba(34, 197, 94, 0.15)',
                                                color: pinjam.status === 'dipinjam' ? '#ff7e14' : '#4ade80',
                                                border: pinjam.status === 'dipinjam' ? '1px solid rgba(249, 115, 22, 0.3)' : '1px solid rgba(34, 197, 94, 0.3)'
                                            }}>
                                                {pinjam.status ? pinjam.status.toUpperCase() : 'DIPINJAM'}
                                            </span>
                                        </td>
                                        <td style={{ padding: '14px 12px', textAlign: 'center' }}>
                                            {pinjam.status === 'dipinjam' && (
                                                <button 
                                                    onClick={() => handleKembalikanBuku(pinjam.id_pinjam)}
                                                    style={{ padding: '6px 14px', marginRight: '8px', background: 'rgba(34, 197, 94, 0.15)', color: '#4ade80', border: '1px solid rgba(34, 197, 94, 0.3)', borderRadius: '6px', cursor: 'pointer', fontWeight: '600', fontSize: '13px', transition: 'all 0.2s' }}
                                                    onMouseEnter={(e) => { e.target.style.background = '#22c55e'; e.target.style.color = 'white'; }}
                                                    onMouseLeave={(e) => { e.target.style.background = 'rgba(34, 197, 94, 0.15)'; e.target.style.color = '#4ade80'; }}
                                                >
                                                    Kembali
                                                </button>
                                            )}
                                            
                                            {/* 🔥 MODIFIKASI: Mengganti trigger window.confirm dengan mengisi state transaksiMauDihapus */}
                                            <button 
                                                onClick={() => setTransaksiMauDihapus(pinjam)}
                                                style={{ padding: '6px 14px', background: 'rgba(239, 68, 68, 0.15)', color: '#f87171', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: '6px', cursor: 'pointer', fontWeight: '600', fontSize: '13px', transition: 'all 0.2s' }}
                                                onMouseEnter={(e) => { e.target.style.background = '#dc3545'; e.target.style.color = 'white'; }}
                                                onMouseLeave={(e) => { e.target.style.background = 'rgba(239, 68, 68, 0.15)'; e.target.style.color = '#f87171'; }}
                                            >
                                                Hapus
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })
                        ) : (
                            <tr>
                                <td colSpan="8" style={{ padding: '30px', textAlign: 'center', color: '#64748b', fontSize: '14px' }}>Belum ada data transaksi peminjaman di database.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* ================= POP-UP INPUT DATA PEMINJAMAN ================= */}
            {tampilkanForm && (
                <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(15, 23, 42, 0.75)', backdropFilter: 'blur(8px)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 9999 }}>
                    <div style={{ width: '400px', backgroundColor: 'rgba(30, 41, 59, 0.9)', padding: '30px', borderRadius: '16px', border: '1px solid rgba(255, 255, 255, 0.15)', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)', position: 'relative', boxSizing: 'border-box' }}>
                        
                        <button 
                            type="button"
                            onClick={() => setTampilkanForm(false)}
                            style={{ position: 'absolute', top: '18px', right: '18px', background: 'none', border: 'none', color: '#94a3b8', fontSize: '18px', cursor: 'pointer', fontWeight: 'bold', padding: '5px', transition: 'color 0.2s' }}
                            onMouseEnter={(e) => e.target.style.color = '#f87171'}
                            onMouseLeave={(e) => e.target.style.color = '#94a3b8'}
                        >
                            ✕
                        </button>

                        <h3 style={{ borderBottom: '2px solid #38bdf8', paddingBottom: '12px', marginTop: 0, fontWeight: '700', fontSize: '18px', color: '#38bdf8' }}>
                        Buat Peminjaman Baru
                        </h3>
                        
                        <form onSubmit={handleSimpanPeminjaman} style={{ display: 'flex', flexDirection: 'column', gap: '18px', marginTop: '15px' }}>
                            <div>
                                <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '600', color: '#cbd5e1' }}>ID Anggota (Siswa):</label>
                                <input 
                                    type="number" 
                                    value={idAnggota} 
                                    onChange={(e) => setIdAnggota(e.target.value)}
                                    style={{ width: '100%', padding: '11px 14px', borderRadius: '8px', backgroundColor: 'rgba(15, 23, 42, 0.6)', color: 'white', border: '1px solid rgba(255,255,255,0.15)', boxSizing: 'border-box', outline: 'none', fontSize: '14px' }} 
                                />
                            </div>

                            <div>
                                <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '600', color: '#cbd5e1' }}>ID Buku Asli (Dari Database):</label>
                                <input 
                                    type="number" 
                                    placeholder="Contoh: 1" 
                                    value={idBuku} 
                                    onChange={(e) => setIdBuku(e.target.value)}
                                    style={{ width: '100%', padding: '11px 14px', borderRadius: '8px', backgroundColor: 'rgba(15, 23, 42, 0.6)', color: 'white', border: '1px solid rgba(255,255,255,0.15)', boxSizing: 'border-box', outline: 'none', fontSize: '14px' }} 
                                />
                            </div>

                            <div>
                                <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '600', color: '#cbd5e1' }}>Tanggal Pinjam:</label>
                                <input 
                                    type="date" 
                                    value={tglPinjam} 
                                    onChange={(e) => setTglPinjam(e.target.value)}
                                    style={{ width: '100%', padding: '11px 14px', borderRadius: '8px', backgroundColor: 'rgba(15, 23, 42, 0.6)', color: 'white', border: '1px solid rgba(255,255,255,0.15)', boxSizing: 'border-box', outline: 'none', fontSize: '14px' }} 
                                />
                            </div>

                            <div>
                                <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '600', color: '#cbd5e1' }}>Tanggal Harus Kembali:</label>
                                <input 
                                    type="date" 
                                    value={tglKembali} 
                                    onChange={(e) => setTglKembali(e.target.value)}
                                    style={{ width: '100%', padding: '11px 14px', borderRadius: '8px', backgroundColor: 'rgba(15, 23, 42, 0.6)', color: 'white', border: '1px solid rgba(255,255,255,0.15)', boxSizing: 'border-box', outline: 'none', fontSize: '14px' }} 
                                />
                            </div>

                            <div style={{ display: 'flex', gap: '12px', marginTop: '10px' }}>
                                <button 
                                    type="button" 
                                    onClick={() => setTampilkanForm(false)}
                                    style={{ flex: 1, padding: '11px', background: '#475569', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '14px' }}
                                >
                                    Batal
                                </button>
                                <button 
                                    type="submit" 
                                    disabled={loading}
                                    style={{ flex: 1, padding: '11px', background: loading ? '#334155' : '#16a34a', color: 'white', border: 'none', borderRadius: '8px', cursor: loading ? 'not-allowed' : 'pointer', fontWeight: '600', fontSize: '14px', boxShadow: '0 4px 12px rgba(22, 163, 74, 0.2)' }}
                                >
                                    {loading ? 'Memproses...' : 'Simpan'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* 🔥 BARU: POP-UP MODAL VALIDASI HAPUS CUSTOM GLASSMORPHISM DI TENGAH */}
            {transaksiMauDihapus && (
                <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: 'rgba(15, 23, 42, 0.8)', backdropFilter: 'blur(12px)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 10000 }}>
                    <div style={{ width: '420px', backgroundColor: 'rgba(30, 41, 59, 0.95)', padding: '30px', borderRadius: '16px', border: '1px solid rgba(239, 68, 68, 0.3)', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.6)', textAlign: 'center', boxSizing: 'border-box' }}>
                        <div style={{ fontSize: '42px', marginBottom: '12px' }}>⚠️</div>
                        <h3 style={{ margin: '0 0 10px 0', fontWeight: '700', color: '#f87171', fontSize: '19px', letterSpacing: '0.3px' }}>Konfirmasi Hapus Transaksi</h3>
                        <p style={{ margin: '0 0 25px 0', color: '#cbd5e1', fontSize: '14px', lineHeight: '1.6' }}>
                            Apakah kamu benar-benar yakin ingin menghapus permanen data <br />
                            transaksi peminjaman <strong style={{ color: '#fbbf24' }}># {transaksiMauDihapus.id_pinjam}</strong>? <br />
                            <span style={{ color: '#94a3b8', fontSize: '12px' }}>Tindakan ini akan menghapus riwayat sirkulasi data secara permanen.</span>
                        </p>
                        <div style={{ display: 'flex', gap: '12px' }}>
                            <button type="button" onClick={() => setTransaksiMauDihapus(null)} style={{ flex: 1, padding: '11px', background: '#475569', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '14px', transition: 'background 0.2s' }} onMouseEnter={(e) => e.target.style.background = '#334155'} onMouseLeave={(e) => e.target.style.background = '#475569'}>
                                Batal
                            </button>
                            <button type="button" onClick={eksekusiHapusPeminjaman} style={{ flex: 1, padding: '11px', background: '#dc2626', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '14px', boxShadow: '0 4px 12px rgba(220, 38, 38, 0.3)', transition: 'background 0.2s' }} onMouseEnter={(e) => e.target.style.background = '#b91c1c'} onMouseLeave={(e) => e.target.style.background = '#dc2626'}>
                                🔥 Ya, Hapus!
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DashboardPeminjaman;