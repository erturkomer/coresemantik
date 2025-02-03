import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
    setError('');
  };

  const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(String(email).toLowerCase());
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form fields
    if (!formData.name || !formData.email || !formData.password) {
      setError('Lütfen tüm alanları doldurunuz.');
      return;
    }

    // Validate email format
    if (!validateEmail(formData.email)) {
      setError('Lütfen geçerli bir email adresi girin.');
      return;
    }

    // Password validation
    if (formData.password !== formData.confirmPassword) {
      setError('Şifreler eşleşmiyor.');
      return;
    }

    // Password strength check
    if (formData.password.length < 8) {
      setError('Şifre en az 8 karakter uzunluğunda olmalıdır.');
      return;
    }

    // Additional password strength checks
    if (!/[A-Z]/.test(formData.password)) {
      setError('Şifre en az bir büyük harf içermelidir.');
      return;
    }

    if (!/[a-z]/.test(formData.password)) {
      setError('Şifre en az bir küçük harf içermelidir.');
      return;
    }

    if (!/[0-9]/.test(formData.password)) {
      setError('Şifre en az bir rakam içermelidir.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await axios.post('/api/auth/register', {
        name: formData.name,
        email: formData.email,
        password: formData.password
      });

      // Show success toast
      toast.success('Kayıt başarılı! Giriş yapabilirsiniz.');
      
      // Redirect to login page
      navigate('/login');
    } catch (err) {
      // Handle registration errors
      const errorMsg = err.response?.data?.message || 'Kayıt sırasında bir hata oluştu.';
      setError(errorMsg);
      
      // Show error toast
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#121221] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-[#1e1e2e] p-8 rounded-xl shadow-lg">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-100">
            Hesap Oluştur
          </h2>
          <p className="mt-2 text-center text-sm text-gray-400">
            Zaten bir hesabınız var mı? {' '}
            <Link to="/login" className="font-medium text-cyan-600 hover:text-cyan-500">
              Giriş Yap
            </Link>
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm space-y-4">
            {/* Name Input */}
            <div>
              <label htmlFor="name" className="sr-only">Ad Soyad</label>
              <input
                id="name"
                name="name"
                type="text"
                required
                className="appearance-none rounded-md relative block w-full px-3 py-2 bg-[#121221] border border-gray-700 placeholder-gray-500 text-gray-100 focus:outline-none focus:ring-cyan-500 focus:border-cyan-500 focus:z-10 sm:text-sm"
                placeholder="Ad Soyad"
                value={formData.name}
                onChange={handleChange}
              />
            </div>

            {/* Email Input */}
            <div>
              <label htmlFor="email" className="sr-only">Email</label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="appearance-none rounded-md relative block w-full px-3 py-2 bg-[#121221] border border-gray-700 placeholder-gray-500 text-gray-100 focus:outline-none focus:ring-cyan-500 focus:border-cyan-500 focus:z-10 sm:text-sm"
                placeholder="Email Adresi"
                value={formData.email}
                onChange={handleChange}
              />
            </div>

            {/* Password Input */}
            <div>
              <label htmlFor="password" className="sr-only">Şifre</label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                required
                className="appearance-none rounded-md relative block w-full px-3 py-2 bg-[#121221] border border-gray-700 placeholder-gray-500 text-gray-100 focus:outline-none focus:ring-cyan-500 focus:border-cyan-500 focus:z-10 sm:text-sm"
                placeholder="Şifre"
                value={formData.password}
                onChange={handleChange}
              />
            </div>

            {/* Confirm Password Input */}
            <div>
              <label htmlFor="confirm-password" className="sr-only">Şifreyi Onayla</label>
              <input
                id="confirm-password"
                name="confirmPassword"
                type="password"
                autoComplete="new-password"
                required
                className="appearance-none rounded-md relative block w-full px-3 py-2 bg-[#121221] border border-gray-700 placeholder-gray-500 text-gray-100 focus:outline-none focus:ring-cyan-500 focus:border-cyan-500 focus:z-10 sm:text-sm"
                placeholder="Şifreyi Onayla"
                value={formData.confirmPassword}
                onChange={handleChange}
              />
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="text-red-500 text-sm text-center">
              {error}
            </div>
          )}

          {/* Submit Button */}
          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-cyan-600 hover:bg-cyan-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500 disabled:opacity-50"
            >
              {loading ? (
                <div className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Kayıt Olunuyor...
                </div>
              ) : (
                'Kayıt Ol'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Register;