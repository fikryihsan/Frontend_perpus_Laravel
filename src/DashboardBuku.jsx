import React, { useEffect, useState } from 'react';
import API from './api/api';

function DashboardBuku({ logoutSukses }) {
    const [daftarBuku, setDaftarBuku] = useState([]);
    const [error, setError] = useState('');
    const [pesanSukses, setPesanSukses] = useState('');

    const [idBukuDiedit, setIdBukuDiedit] = useState(null);
    const [judul, setJudul] = useState('');
    const [penulis, setPenulis] = useState('');
    const [stok, setStok] = useState('');
    const [kataKunciCari, setKataKunciCari] = useState('');
    const [isSearching, setIsSearching] = useState(false);

    const [tampilkanForm, setTampilkanForm] = useState(false);

    // 🔥 STATE BARU: Menyimpan data objek buku yang hendak dihapus untuk memicu pop-up custom
    const [bukuMauDihapus, setBukuMauDihapus] = useState(null);

    const ambilDataBuku = async () => {
        try {
            const response = await API.get('/buku');
            setDaftarBuku(response.data);
        } catch (err) {
            if (err.response && err.response.status === 401) {
                setError('Sesi habis, silakan login ulang.');
                handleLogout();
            } else {
                setError('Gagal mengambil data buku perpustakaan.');
            }
        }
    };

    // 🔥 LOGIKA BARU: Pencarian Otomatis Deteksi Angka (ID) / Teks (Judul)
    const handleCariBuku = async (e) => {
        e.preventDefault();
        setError('');
        setPesanSukses('');

        const kataKunciClean = kataKunciCari.trim();

        if (!kataKunciClean) {
            setIsSearching(false);
            ambilDataBuku();
            return;
        }

        setIsSearching(true);

        try {
            // Cek apakah inputan FULL ANGKA murni menggunakan regex
            const apakahAngkaMurni = /^\d+$/.test(kataKunciClean);

            if (apakahAngkaMurni) {
                // Jika angka murni, langsung tembak API ID Buku
                const response = await API.get(`/buku/${kataKunciClean}`);
                if (response.data) {
                    setDaftarBuku([response.data]);
                } else {
                    setError(`Buku dengan ID #${kataKunciClean} tidak ditemukan.`);
                    setDaftarBuku([]);
                }
            } else {
                // Jika mengandung huruf/teks, tembak API Query Search Judul
                const response = await API.get(`/buku?search=${kataKunciClean}`);
                if (response.data && response.data.length > 0) {
                    setDaftarBuku(response.data);
                } else {
                    setError(`Tidak ada buku yang mengandung judul "${kataKunciClean}" di database.`);
                    setDaftarBuku([]);
                }
            }
        } catch (err) {
            console.error(err);
            setError('Pencarian gagal, data tidak ditemukan atau server bermasalah.');
            setDaftarBuku([]);
        }
    };

    const resetPencarian = () => {
        setKataKunciCari('');
        setIsSearching(false);
        setError(''); // Sekaligus bersihkan pesan error salah cari
        ambilDataBuku();
    };

    const handleSimpanBuku = async (e) => {
        e.preventDefault();
        setError('');
        setPesanSukses('');

        if (!judul || !stok) {
            setError('Kolom Judul dan Stok wajib diisi ya!');
            return;
        }

        try {
            if (idBukuDiedit !== null && idBukuDiedit !== undefined && idBukuDiedit !== '') {
                await API.put(`/buku/${idBukuDiedit}`, { judul, stok: parseInt(stok) });
                setPesanSukses('Buku berhasil diperbarui/di-update!');
            } else {
                if (!penulis) {
                    setError('Untuk buku baru, kolom Penulis wajib diisi!');
                    return;
                }
                await API.post('/buku', { judul, penulis, stok: parseInt(stok) });
                setPesanSukses('Buku baru berhasil ditambahkan!');
            }

            resetForm();
            setTampilkanForm(false); 
            ambilDataBuku();
        } catch (err) {
            console.error(err.response);
            setError(err.response?.data?.message || 'Gagal memproses data buku.');
        }
    };

    const eksekusiHapusBuku = async () => {
        if (!bukuMauDihapus) return;

        setError('');
        setPesanSukses('');
        try {
            await API.delete(`/buku/${bukuMauDihapus.id_buku}`);
            setPesanSukses(`Buku "${bukuMauDihapus.judul}" berhasil dihapus dari perpustakaan!`);
            setBukuMauDihapus(null); 
            ambilDataBuku();
        } catch (err) {
            setBukuMauDihapus(null); 
            if (err.response && err.response.status === 401) {
                setError('Sesi kamu sudah habis, silakan login kembali.');
            } else {
                setError('Gagal menghapus buku. Kemungkinan besar buku sedang dipinjam siswa!');
            }
        }
    };

    const aktifkanModeEdit = (buku) => {
        setIdBukuDiedit(buku.id_buku);
        setJudul(buku.judul || '');
        setPenulis(buku.penulis || '');
        setStok(buku.stok || 0);
        setTampilkanForm(true); 
    };

    const resetForm = () => {
        setIdBukuDiedit(null);
        setJudul('');
        setPenulis('');
        setStok('');
    };

    const handleLogout = async () => {
        try { await API.post('/logout'); } catch (err) {}
        localStorage.removeItem('token');
        if (logoutSukses) logoutSukses();
        window.location.reload();
    };

    useEffect(() => {
        ambilDataBuku();
    }, []);

    return (
        <div style={{ 
            fontFamily: "'Segoe UI', Roboto, Helvetica, Arial, sans-serif", 
            color: 'white',
            padding: '10px 5px',
            width: '100%', 
            boxSizing: 'border-box'
        }}>
            
            {/* HEADER ATAS */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px', borderBottom: '1px solid rgba(255, 255, 255, 0.1)', paddingBottom: '15px' }}>
                <div>
                    <h2 style={{ margin: 0, fontWeight: '700', fontSize: '24px', letterSpacing: '0.5px' }}>
                        📚 Buku
                    </h2>
                    <p style={{ margin: '4px 0 0 0', color: '#94a3b8', fontSize: '13px' }}>Kelola daftar koleksi buku perpustakaan secara real-time</p>
                </div>
            </div>

            {/* NOTIFIKASI PESAN */}
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

            {/* KONTROL BAR (PENCARIAN SMART & TAMBAH) */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '20px', marginBottom: '25px', flexWrap: 'wrap' }}>
                <button 
                    onClick={() => { resetForm(); setTampilkanForm(true); }}
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
                 Tambah Buku Baru
                </button>

                {/* 🔥 PERBAIKAN FORM: Elemen <select> dihapus, dan placeholder disesuaikan */}
                <form onSubmit={handleCariBuku} style={{ display: 'flex', gap: '10px', flex: '1', maxWidth: '550px' }}>
                    <input 
                        type="text" 
                        placeholder="Ketik ID atau Judul Buku yang dicari..." 
                        value={kataKunciCari} 
                        onChange={(e) => setKataKunciCari(e.target.value)} 
                        style={{ flex: '1', padding: '11px 16px', borderRadius: '8px', backgroundColor: 'rgba(15, 23, 42, 0.6)', color: 'white', border: '1px solid rgba(255,255,255,0.15)', outline: 'none', fontSize: '14px', transition: 'all 0.3s' }} 
                        onFocus={(e) => e.target.style.borderColor = '#38bdf8'}
                        onBlur={(e) => e.target.style.borderColor = 'rgba(255,255,255,0.15)'}
                    />
                    
                    <button type="submit" style={{ padding: '11px 22px', background: '#0284c7', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '14px', boxShadow: '0 4px 12px rgba(2, 132, 199, 0.25)' }}>Cari</button>
                    
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

            {/* TABEL GLASSMORPHISM */}
            <div style={{ 
                backgroundColor: 'rgba(30, 41, 59, 0.4)', 
                padding: '10px', 
                borderRadius: '16px', 
                border: '1px solid rgba(255, 255, 255, 0.08)',
                backdropFilter: 'blur(10px)',
                overflowX: 'auto'
            }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
                    <thead>
                        <tr style={{ borderBottom: '2px solid rgba(255, 255, 255, 0.1)', textAlign: 'left', color: '#94a3b8' }}>
                            <th style={{ padding: '16px 12px', fontWeight: '600', width: '60px', textAlign: 'center' }}>No</th>
                            <th style={{ padding: '16px 12px', fontWeight: '600', width: '110px' }}>ID Buku</th>
                            <th style={{ padding: '16px 12px', fontWeight: '600' }}>Judul Buku</th>
                            <th style={{ padding: '16px 12px', fontWeight: '600', width: '100px', textAlign: 'center' }}>Stok</th>
                            <th style={{ padding: '16px 12px', fontWeight: '600', textAlign: 'center', width: '160px' }}>Aksi</th>
                        </tr>
                    </thead>
                    <tbody>
                        {daftarBuku.length > 0 ? (
                            daftarBuku.map((buku, index) => (
                                <tr 
                                    key={buku.id_buku} 
                                    style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.05)', transition: 'background-color 0.2s' }}
                                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.03)'}
                                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                                >
                                    <td style={{ padding: '14px 12px', textAlign: 'center', color: '#64748b' }}>{index + 1}</td>
                                    <td style={{ padding: '14px 12px', fontWeight: '700', color: '#38bdf8' }}>#{buku.id_buku}</td>
                                    <td style={{ padding: '14px 12px', fontWeight: '500', color: '#f1f5f9' }}>{buku.judul}</td>
                                    <td style={{ padding: '14px 12px', textAlign: 'center' }}>
                                        <span style={{ 
                                            backgroundColor: buku.stok > 0 ? 'rgba(56, 189, 248, 0.12)' : 'rgba(239, 68, 68, 0.15)', 
                                            color: buku.stok > 0 ? '#38bdf8' : '#f87171',
                                            padding: '4px 10px',
                                            borderRadius: '6px',
                                            fontWeight: '600',
                                            fontSize: '13px'
                                        }}>
                                            {buku.stok} Pcs
                                        </span>
                                    </td>
                                    <td style={{ padding: '14px 12px', textAlign: 'center' }}>
                                        <button 
                                            onClick={() => aktifkanModeEdit(buku)} 
                                            style={{ padding: '6px 14px', marginRight: '8px', background: 'rgba(245, 158, 11, 0.15)', color: '#fbbf24', border: '1px solid rgba(245, 158, 11, 0.3)', borderRadius: '6px', cursor: 'pointer', fontWeight: '600', fontSize: '13px', transition: 'all 0.2s' }}
                                            onMouseEnter={(e) => { e.target.style.background = '#d97706'; e.target.style.color = 'white'; }}
                                            onMouseLeave={(e) => { e.target.style.background = 'rgba(245, 158, 11, 0.15)'; e.target.style.color = '#fbbf24'; }}
                                        >
                                            Edit
                                        </button>
                                        <button 
                                            onClick={() => setBukuMauDihapus(buku)} 
                                            style={{ padding: '6px 14px', background: 'rgba(239, 68, 68, 0.15)', color: '#f87171', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: '6px', cursor: 'pointer', fontWeight: '600', fontSize: '13px', transition: 'all 0.2s' }}
                                            onMouseEnter={(e) => { e.target.style.background = '#dc3545'; e.target.style.color = 'white'; }}
                                            onMouseLeave={(e) => { e.target.style.background = 'rgba(239, 68, 68, 0.15)'; e.target.style.color = '#f87171'; }}
                                        >
                                            Hapus
                                        </button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr><td colSpan="5" style={{ padding: '30px', textAlign: 'center', color: '#64748b', fontSize: '14px' }}>Tidak ada koleksi data buku di database perpustakaan.</td></tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* POP-UP INPUT/EDIT DATA BUKU */}
            {tampilkanForm && (
                <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(15, 23, 42, 0.75)', backdropFilter: 'blur(8px)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 9999 }}>
                    <div style={{ width: '400px', backgroundColor: 'rgba(30, 41, 59, 0.9)', padding: '30px', borderRadius: '16px', border: '1px solid rgba(255, 255, 255, 0.15)', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)', position: 'relative', boxSizing: 'border-box' }}>
                        
                        <button 
                            type="button"
                            onClick={() => { setTampilkanForm(false); resetForm(); }}
                            style={{ position: 'absolute', top: '18px', right: '18px', background: 'none', border: 'none', color: '#94a3b8', fontSize: '18px', cursor: 'pointer', fontWeight: 'bold', padding: '5px', transition: 'color 0.2s' }}
                            onMouseEnter={(e) => e.target.style.color = '#f87171'}
                            onMouseLeave={(e) => e.target.style.color = '#94a3b8'}
                        >
                            ✕
                        </button>

                        <h3 style={{ borderBottom: '2px solid #38bdf8', paddingBottom: '12px', marginTop: 0, fontWeight: '700', fontSize: '18px', color: '#38bdf8' }}>
                            {idBukuDiedit ? 'Edit Data Buku' : 'Tambah Koleksi Baru'}
                        </h3>
                        
                        <form onSubmit={handleSimpanBuku} style={{ display: 'flex', flexDirection: 'column', gap: '18px', marginTop: '15px' }}>
                            <div>
                                <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '600', color: '#cbd5e1' }}>Judul Buku</label>
                                <input type="text" placeholder="Ketik judul buku..." value={judul} onChange={(e) => setJudul(e.target.value)} style={{ width: '100%', padding: '11px 14px', borderRadius: '8px', backgroundColor: 'rgba(15, 23, 42, 0.6)', color: 'white', border: '1px solid rgba(255,255,255,0.15)', boxSizing: 'border-box', outline: 'none', fontSize: '14px' }} />
                            </div>
                            
                            {!idBukuDiedit && (
                                <div>
                                    <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '600', color: '#cbd5e1' }}>Penulis / Pengarang</label>
                                    <input type="text" placeholder="Nama penulis..." value={penulis} onChange={(e) => setPenulis(e.target.value)} style={{ width: '100%', padding: '11px 14px', borderRadius: '8px', backgroundColor: 'rgba(15, 23, 42, 0.6)', color: 'white', border: '1px solid rgba(255,255,255,0.15)', boxSizing: 'border-box', outline: 'none', fontSize: '14px' }} />
                                </div>
                            )}
                            
                            <div>
                                <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '600', color: '#cbd5e1' }}>Jumlah Stok Tersedia</label>
                                <input type="number" placeholder="Contoh: 10" value={stok} onChange={(e) => setStok(e.target.value)} style={{ width: '100%', padding: '11px 14px', borderRadius: '8px', backgroundColor: 'rgba(15, 23, 42, 0.6)', color: 'white', border: '1px solid rgba(255,255,255,0.15)', boxSizing: 'border-box', outline: 'none', fontSize: '14px' }} />
                            </div>
                            
                            <div style={{ display: 'flex', gap: '12px', marginTop: '10px' }}>
                                <button type="button" onClick={() => { setTampilkanForm(false); resetForm(); }} style={{ flex: 1, padding: '11px', background: '#475569', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '14px' }}>Batal</button>
                                <button type="submit" style={{ flex: 2, padding: '11px', background: idBukuDiedit ? '#d97706' : '#16a34a', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '14px', boxShadow: idBukuDiedit ? '0 4px 12px rgba(217, 119, 6, 0.2)' : '0 4px 12px rgba(22, 163, 74, 0.2)' }}>
                                    {idBukuDiedit ? 'Update Data' : 'Tambahkan'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* POP-UP MODAL VALIDASI HAPUS */}
            {bukuMauDihapus && (
                <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: 'rgba(15, 23, 42, 0.8)', backdropFilter: 'blur(12px)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 10000 }}>
                    <div style={{ width: '420px', backgroundColor: 'rgba(30, 41, 59, 0.95)', padding: '30px', borderRadius: '16px', border: '1px solid rgba(239, 68, 68, 0.3)', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.6)', textAlign: 'center', boxSizing: 'border-box' }}>
                        <div style={{ fontSize: '42px', marginBottom: '12px' }}>⚠️</div>
                        <h3 style={{ margin: '0 0 10px 0', fontWeight: '700', color: '#f87171', fontSize: '19px', letterSpacing: '0.3px' }}>Konfirmasi Hapus Koleksi</h3>
                        <p style={{ margin: '0 0 25px 0', color: '#cbd5e1', fontSize: '14px', lineHeight: '1.6' }}>
                            Apakah kamu yakin ingin menghapus permanen buku <br />
                            <strong style={{ color: '#fbbf24' }}>"{bukuMauDihapus.judul}"</strong> (ID: #{bukuMauDihapus.id_buku})? <br />
                            <span style={{ color: '#94a3b8', fontSize: '12px' }}>Aksi ini tidak dapat dikembalikan oleh sistem.</span>
                        </p>
                        <div style={{ display: 'flex', gap: '12px' }}>
                            <button type="button" onClick={() => setBukuMauDihapus(null)} style={{ flex: 1, padding: '11px', background: '#475569', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '14px', transition: 'background 0.2s' }} onMouseEnter={(e) => e.target.style.background = '#334155'} onMouseLeave={(e) => e.target.style.background = '#475569'}>
                                Batal
                            </button>
                            <button type="button" onClick={eksekusiHapusBuku} style={{ flex: 1, padding: '11px', background: '#dc2626', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '14px', boxShadow: '0 4px 12px rgba(220, 38, 38, 0.3)', transition: 'background 0.2s' }} onMouseEnter={(e) => e.target.style.background = '#b91c1c'} onMouseLeave={(e) => e.target.style.background = '#dc2626'}>
                                 Ya, Hapus!
                            </button>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
}

export default DashboardBuku;