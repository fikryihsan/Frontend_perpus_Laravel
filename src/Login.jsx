import React, { useState } from 'react';
import API from './api/api'; // Import konfigurasi Axios kita tadi

function Login(props) {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [pesan, setPesan] = useState('');
    const [error, setError] = useState('');
    
    // 🔥 TAMBAHAN STATE: Untuk mengatur buka/tutup mata password
    const [lihatPassword, setLihatPassword] = useState(false);

    const handleLogin = async (e) => {
        e.preventDefault();
        setPesan('');
        setError('');

        try {
            // Tembak API Login Laravel kita
            const response = await API.post('/login', { username, password });
            
            // Ambil token dari response Laravel
            const token = response.data.access_token;
            
            // Simpan token ke dalam LocalStorage browser agar awet
            localStorage.setItem('token', token);
            
            setPesan('Login sukses geng!');
            if(props.suksesLogin) {
                props.suksesLogin();
            }
        } catch (err) {
            // Tangkap pesan error bahasa Indonesia dari Laravel kita kemarin
            if (err.response && err.response.data) {
                setError(err.response.data.message);
            } else {
                setError('Waduh, gagal terhubung ke server Laravel.');
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
                <div style={{ textAlign: 'center', marginBottom: '30px' }}>
                    <h2 style={{ margin: '0 0 10px 0', fontWeight: '700', color: '#38bdf8', textShadow: '0 2px 4px rgba(0,0,0,0.3)' }}>Welcome</h2>
                    <p style={{ margin: 0, color: '#cbd5e1', fontSize: '14px', fontWeight: '500' }}>Silakan masuk ke akun Perpustakaan kamu</p>
                </div>

                {pesan && (
                    <div style={{ backgroundColor: 'rgba(34, 197, 94, 0.25)', color: '#4ade80', padding: '12px', borderRadius: '8px', fontSize: '14px', marginBottom: '20px', border: '1px solid rgba(34, 197, 94, 0.4)', textAlign: 'center', fontWeight: '600' }}>
                        {pesan}
                    </div>
                )}
                {error && (
                    <div style={{ backgroundColor: 'rgba(239, 68, 68, 0.25)', color: '#f87171', padding: '12px', borderRadius: '8px', fontSize: '14px', marginBottom: '20px', border: '1px solid rgba(239, 68, 68, 0.4)', textAlign: 'center', fontWeight: '600' }}>
                        {error}
                    </div>
                )}

                <form onSubmit={handleLogin}>
                    <div style={{ marginBottom: '20px' }}>
                        <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '600', color: '#f1f5f9' }}>Username</label>
                        <input 
                            type="text" 
                            placeholder="Ketik username kamu..."
                            value={username} 
                            onChange={(e) => setUsername(e.target.value)} 
                            style={{ 
                                width: '100%', 
                                padding: '12px 16px', 
                                boxSizing: 'border-box',
                                borderRadius: '8px',
                                border: '1px solid rgba(255, 255, 255, 0.2)',
                                backgroundColor: 'rgba(15, 23, 42, 0.6)', 
                                color: 'white',
                                fontSize: '15px',
                                outline: 'none',
                                transition: 'all 0.3s ease'
                            }}
                            onFocus={(e) => {
                                e.target.style.borderColor = '#38bdf8';
                                e.target.style.backgroundColor = 'rgba(15, 23, 42, 0.8)';
                            }}
                            onBlur={(e) => {
                                e.target.style.borderColor = 'rgba(255, 255, 255, 0.2)';
                                e.target.style.backgroundColor = 'rgba(15, 23, 42, 0.6)';
                            }}
                        />
                    </div>
                    
                    <div style={{ marginBottom: '25px' }}>
                        <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '600', color: '#f1f5f9' }}>Password</label>
                        
                        {/* 👁️ CONTAINER INPUT PASSWORD + TOMBOL MATA */}
                        <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                            <input 
                                type={lihatPassword ? "text" : "password"} // 🔥 Berubah dinamis tergantung state
                                placeholder="Ketik password kamu..."
                                value={password} 
                                onChange={(e) => setPassword(e.target.value)} 
                                style={{ 
                                    width: '100%', 
                                    padding: '12px 45px 12px 16px', // Dikasih space kanan 45px biar teks gak ketimpa tombol mata
                                    boxSizing: 'border-box',
                                    borderRadius: '8px',
                                    border: '1px solid rgba(255, 255, 255, 0.2)',
                                    backgroundColor: 'rgba(15, 23, 42, 0.6)',
                                    color: 'white',
                                    fontSize: '15px',
                                    outline: 'none',
                                    transition: 'all 0.3s ease'
                                }}
                                onFocus={(e) => {
                                    e.target.parentElement.children[0].style.borderColor = '#38bdf8';
                                    e.target.parentElement.children[0].style.backgroundColor = 'rgba(15, 23, 42, 0.8)';
                                }}
                                onBlur={(e) => {
                                    e.target.parentElement.children[0].style.borderColor = 'rgba(255, 255, 255, 0.2)';
                                    e.target.parentElement.children[0].style.backgroundColor = 'rgba(15, 23, 42, 0.6)';
                                }}
                            />
                            {/* TOMBOL GAMBAR MATA */}
                            <button
                                type="button"
                                onClick={() => setLihatPassword(!lihatPassword)}
                                style={{
                                    position: 'absolute',
                                    right: '15px',
                                    background: 'none',
                                    border: 'none',
                                    color: lihatPassword ? '#38bdf8' : '#cbd5e1', // Menyala biru kalau aktif ngeliat
                                    fontSize: '18px',
                                    cursor: 'pointer',
                                    outline: 'none',
                                    padding: 0,
                                    display: 'flex',
                                    alignItems: 'center',
                                    userSelect: 'none'
                                }}
                            >
                                {lihatPassword ? '👁️' : '🙈'} {/* Ikon berubah otomatis */}
                            </button>
                        </div>
                    </div>

                    <button 
                        type="submit" 
                        style={{ 
                            width: '100%', 
                            padding: '12px', 
                            background: '#0284c7', 
                            color: 'white', 
                            border: 'none', 
                            borderRadius: '8px',
                            fontSize: '16px',
                            fontWeight: '600',
                            cursor: 'pointer',
                            transition: 'all 0.3s ease',
                            boxShadow: '0 4px 15px rgba(2, 132, 199, 0.4)'
                        }}
                        onMouseEnter={(e) => {
                            e.target.style.background = '#0369a1';
                            e.target.style.transform = 'translateY(-1.5px)';
                        }}
                        onMouseLeave={(e) => {
                            e.target.style.background = '#0284c7';
                            e.target.style.transform = 'translateY(0)';
                        }}
                    >
                        Masuk Sekarang
                    </button>
                </form>

                <hr style={{ borderColor: 'rgba(255, 255, 255, 0.15)', margin: '25px 0' }} />
                
                <p style={{ fontSize: '14px', textAlign: 'center', margin: 0, color: '#cbd5e1' }}>
                    Belum punya akun?{' '}
                    <span 
                        onClick={props.keHalamanRegister} 
                        style={{ 
                            color: '#38bdf8', 
                            cursor: 'pointer', 
                            textDecoration: 'none',
                            fontWeight: '600',
                            transition: 'color 0.2s ease'
                        }}
                        onMouseEnter={(e) => e.target.style.color = '#7dd3fc'}
                        onMouseLeave={(e) => e.target.style.color = '#38bdf8'}
                    >
                        Daftar Akun Baru
                    </span>
                </p>
            </div>
        </div>
    );
}

export default Login;