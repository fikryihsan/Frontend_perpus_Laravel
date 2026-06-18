import React, { useState } from 'react';
import API from './api/api';

function Register({ keHalamanLogin }) {
    const [name, setName] = useState('');
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    
    // 🔥 TAMBAHAN STATE BARU: Untuk menampung input password konfirmasi
    const [confirmPassword, setConfirmPassword] = useState('');
    
    const [pesan, setPesan] = useState('');
    const [error, setError] = useState('');
    
    // State untuk mengatur buka/tutup mata password
    const [lihatPassword, setLihatPassword] = useState(false);
    const [lihatConfirmPassword, setLihatConfirmPassword] = useState(false);

    const handleRegister = async (e) => {
        e.preventDefault();
        setPesan('');
        setError('');

        // 🔥 VALIDASI BARU: Cek apakah password pertama dan kedua sama atau tidak
        if (password !== confirmPassword) {
            setError('Waduh geng, password konfirmasi kamu gak cocok! Coba cek lagi.');
            return; // Stop proses di sini, jangan tembak API Laravel dulu
        }

        try {
            // Tembak API Register Laravel
            const response = await API.post('/register', { name, username, password });
            
            setPesan(response.data.message + ' Silakan klik login.');
            
            // Kosongkan form kembali setelah sukses
            setName('');
            setUsername('');
            setPassword('');
            setConfirmPassword(''); // Kosongkan juga konfirmasinya
        } catch (err) {
            if (err.response && err.response.data) {
                // Tangkap pesan error bahasa Indonesia dari Laravel
                setError(err.response.data.message);
            } else {
                setError('Waduh, gagal mendaftarkan user baru.');
            }
        }
    };

    return (
        <div style={{ 
            position: 'fixed', 
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center', 
            fontFamily: "'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
            backgroundImage: "linear-gradient(rgba(15, 23, 42, 0.6), rgba(15, 23, 42, 0.7)), url('https://images.unsplash.com/photo-1507842217343-583bb7270b66?q=80&w=1200&auto=format&fit=crop')",
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
            zIndex: 9999
        }}>
            {/* 🔮 CARD GLASSMORPHISM */}
            <div style={{ 
                padding: '40px', 
                width: '100%',
                maxWidth: '420px', 
                borderRadius: '20px', 
                backgroundColor: 'rgba(30, 41, 59, 0.65)', 
                color: 'white',
                boxShadow: '0 20px 40px rgba(0, 0, 0, 0.5)',
                border: '1px solid rgba(255, 255, 255, 0.15)', 
                backdropFilter: 'blur(12px)', 
                WebkitBackdropFilter: 'blur(12px)',
                boxSizing: 'border-box'
            }}>
                <div style={{ textAlign: 'center', marginBottom: '25px' }}>
                    <h2 style={{ margin: '0 0 10px 0', fontWeight: '700', color: '#4ade80', textShadow: '0 2px 4px rgba(0,0,0,0.3)' }}>Daftar Akun</h2>
                    <p style={{ margin: 0, color: '#cbd5e1', fontSize: '14px', fontWeight: '500' }}>Buat akun baru untuk akses Perpustakaan</p>
                </div>

                {pesan && (
                    <div style={{ backgroundColor: 'rgba(40, 167, 69, 0.25)', color: '#4ade80', padding: '12px', borderRadius: '8px', fontSize: '14px', marginBottom: '20px', border: '1px solid rgba(40, 167, 69, 0.4)', textAlign: 'center', fontWeight: '600' }}>
                        {pesan}
                    </div>
                )}
                {error && (
                    <div style={{ backgroundColor: 'rgba(220, 53, 69, 0.25)', color: '#f87171', padding: '12px', borderRadius: '8px', fontSize: '14px', marginBottom: '20px', border: '1px solid rgba(220, 53, 69, 0.4)', textAlign: 'center', fontWeight: '600' }}>
                        {error}
                    </div>
                )}

                <form onSubmit={handleRegister}>
                    {/* INPUT NAMA LENGKAP */}
                    <div style={{ marginBottom: '15px' }}>
                        <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '600', color: '#f1f5f9' }}>Nama Lengkap</label>
                        <input 
                            type="text" 
                            placeholder="Ketik nama lengkap..."
                            value={name} 
                            onChange={(e) => setName(e.target.value)} 
                            style={{ 
                                width: '100%', 
                                padding: '10px 14px', 
                                boxSizing: 'border-box',
                                borderRadius: '8px', 
                                border: '1px solid rgba(255, 255, 255, 0.2)', 
                                backgroundColor: 'rgba(15, 23, 42, 0.6)', 
                                color: 'white',
                                fontSize: '14px',
                                outline: 'none',
                                transition: 'all 0.3s ease'
                            }}
                            onFocus={(e) => {
                                e.target.style.borderColor = '#4ade80';
                                e.target.style.backgroundColor = 'rgba(15, 23, 42, 0.8)';
                            }}
                            onBlur={(e) => {
                                e.target.style.borderColor = 'rgba(255, 255, 255, 0.2)';
                                e.target.style.backgroundColor = 'rgba(15, 23, 42, 0.6)';
                            }}
                        />
                    </div>

                    {/* INPUT USERNAME */}
                    <div style={{ marginBottom: '15px' }}>
                        <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '600', color: '#f1f5f9' }}>Username</label>
                        <input 
                            type="text" 
                            placeholder="Buat nama pengguna..."
                            value={username} 
                            onChange={(e) => setUsername(e.target.value)} 
                            style={{ 
                                width: '100%', 
                                padding: '10px 14px', 
                                boxSizing: 'border-box',
                                borderRadius: '8px', 
                                border: '1px solid rgba(255, 255, 255, 0.2)', 
                                backgroundColor: 'rgba(15, 23, 42, 0.6)', 
                                color: 'white',
                                fontSize: '14px',
                                outline: 'none',
                                transition: 'all 0.3s ease'
                            }}
                            onFocus={(e) => {
                                e.target.style.borderColor = '#4ade80';
                                e.target.style.backgroundColor = 'rgba(15, 23, 42, 0.8)';
                            }}
                            onBlur={(e) => {
                                e.target.style.borderColor = 'rgba(255, 255, 255, 0.2)';
                                e.target.style.backgroundColor = 'rgba(15, 23, 42, 0.6)';
                            }}
                        />
                    </div>
                    
                    {/* INPUT PASSWORD PERTAMA */}
                    <div style={{ marginBottom: '15px' }}>
                        <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '600', color: '#f1f5f9' }}>Password</label>
                        <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                            <input 
                                type={lihatPassword ? "text" : "password"} 
                                placeholder="Buat kata sandi..."
                                value={password} 
                                onChange={(e) => setPassword(e.target.value)} 
                                style={{ 
                                    width: '100%', 
                                    padding: '10px 45px 10px 14px', 
                                    boxSizing: 'border-box',
                                    borderRadius: '8px', 
                                    border: '1px solid rgba(255, 255, 255, 0.2)', 
                                    backgroundColor: 'rgba(15, 23, 42, 0.6)', 
                                    color: 'white',
                                    fontSize: '14px',
                                    outline: 'none',
                                    transition: 'all 0.3s ease'
                                }}
                                onFocus={(e) => {
                                    e.target.parentElement.children[0].style.borderColor = '#4ade80';
                                    e.target.parentElement.children[0].style.backgroundColor = 'rgba(15, 23, 42, 0.8)';
                                }}
                                onBlur={(e) => {
                                    e.target.parentElement.children[0].style.borderColor = 'rgba(255, 255, 255, 0.2)';
                                    e.target.parentElement.children[0].style.backgroundColor = 'rgba(15, 23, 42, 0.6)';
                                }}
                            />
                            <button
                                type="button"
                                onClick={() => setLihatPassword(!lihatPassword)}
                                style={{
                                    position: 'absolute',
                                    right: '15px',
                                    background: 'none',
                                    border: 'none',
                                    color: lihatPassword ? '#4ade80' : '#cbd5e1',
                                    fontSize: '18px',
                                    cursor: 'pointer',
                                    outline: 'none',
                                    padding: 0,
                                    display: 'flex',
                                    alignItems: 'center',
                                    userSelect: 'none'
                                }}
                            >
                                {lihatPassword ? '👁️' : '🙈'}
                            </button>
                        </div>
                    </div>

                    {/* 🔥 INPUT PASSWORD KEDUA (KONFIRMASI PASSWORD) */}
                    <div style={{ marginBottom: '25px' }}>
                        <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '600', color: '#f1f5f9' }}>Ulangi Password</label>
                        <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                            <input 
                                type={lihatConfirmPassword ? "text" : "password"} 
                                placeholder="Ketik ulang kata sandi..."
                                value={confirmPassword} 
                                onChange={(e) => setConfirmPassword(e.target.value)} 
                                style={{ 
                                    width: '100%', 
                                    padding: '10px 45px 10px 14px', 
                                    boxSizing: 'border-box',
                                    borderRadius: '8px', 
                                    border: '1px solid rgba(255, 255, 255, 0.2)', 
                                    backgroundColor: 'rgba(15, 23, 42, 0.6)', 
                                    color: 'white',
                                    fontSize: '14px',
                                    outline: 'none',
                                    transition: 'all 0.3s ease'
                                }}
                                onFocus={(e) => {
                                    e.target.parentElement.children[0].style.borderColor = '#4ade80';
                                    e.target.parentElement.children[0].style.backgroundColor = 'rgba(15, 23, 42, 0.8)';
                                }}
                                onBlur={(e) => {
                                    e.target.parentElement.children[0].style.borderColor = 'rgba(255, 255, 255, 0.2)';
                                    e.target.parentElement.children[0].style.backgroundColor = 'rgba(15, 23, 42, 0.6)';
                                }}
                            />
                            <button
                                type="button"
                                onClick={() => setLihatConfirmPassword(!lihatConfirmPassword)}
                                style={{
                                    position: 'absolute',
                                    right: '15px',
                                    background: 'none',
                                    border: 'none',
                                    color: lihatConfirmPassword ? '#4ade80' : '#cbd5e1',
                                    fontSize: '18px',
                                    cursor: 'pointer',
                                    outline: 'none',
                                    padding: 0,
                                    display: 'flex',
                                    alignItems: 'center',
                                    userSelect: 'none'
                                }}
                            >
                                {lihatConfirmPassword ? '👁️' : '🙈'}
                            </button>
                        </div>
                    </div>

                    <button 
                        type="submit" 
                        style={{ 
                            width: '100%', 
                            padding: '12px', 
                            background: '#16a34a', 
                            color: 'white', 
                            border: 'none', 
                            borderRadius: '8px', 
                            cursor: 'pointer',
                            fontSize: '16px',
                            fontWeight: '600',
                            transition: 'all 0.3s ease',
                            boxShadow: '0 4px 15px rgba(22, 163, 74, 0.4)'
                        }}
                        onMouseEnter={(e) => {
                            e.target.style.background = '#15803d';
                            e.target.style.transform = 'translateY(-1.5px)';
                        }}
                        onMouseLeave={(e) => {
                            e.target.style.background = '#16a34a';
                            e.target.style.transform = 'translateY(0)';
                        }}
                    >
                        Daftar Sekarang
                    </button>
                </form>

                <hr style={{ borderColor: 'rgba(255, 255, 255, 0.15)', margin: '20px 0' }} />
                <p style={{ fontSize: '14px', textAlign: 'center', margin: 0, color: '#cbd5e1' }}>
                    Sudah punya akun?{' '}
                    <span 
                        onClick={keHalamanLogin} 
                        style={{ 
                            color: '#38bdf8', 
                            cursor: 'pointer', 
                            fontWeight: '600',
                            transition: 'color 0.2s ease' 
                        }}
                        onMouseEnter={(e) => e.target.style.color = '#7dd3fc'}
                        onMouseLeave={(e) => e.target.style.color = '#38bdf8'}
                    >
                        Login di sini
                    </span>
                </p>
            </div>
        </div>
    );
}

export default Register;