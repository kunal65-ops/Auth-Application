import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { signupSchema } from '../validations/authValidation';
import { signupApi } from '../api/authApi';
import { useAuth } from '../context/AuthContext';

const Signup = () => {
  const navigate = useNavigate();
  const { setAuth } = useAuth();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm({
    resolver: zodResolver(signupSchema),
    mode: 'onTouched'
  });

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const { confirmPassword, ...payload } = data;
      const response = await signupApi(payload);
      if (response?.success) {
        setAuth(response.data.user, response.data.accessToken);
        toast.success(response.message || 'Registration successful! Welcome.');
        navigate('/dashboard');
      }
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Signup failed. Please try again.';
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h1 className="auth-title">Create Account</h1>
        <p className="auth-subtitle">Sign up to get started with MERN Auth</p>
        <form onSubmit={handleSubmit(onSubmit)} noValidate>

          <div className="form-group">
            <label className="form-label" htmlFor="name">Full Name</label>
            <input
              id="name"
              type="text"
              className="form-input"
              placeholder="John Doe"
              {...register('name')}
            />
            {errors.name && (
              <span className="error-message">{errors.name.message}</span>
            )}
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="dob">Date of Birth</label>
            <input
              id="dob"
              type="date"
              className="form-input"
              max={new Date().toISOString().split('T')[0]}
              {...register('dob')}
            />
            {errors.dob && (
              <span className="error-message">{errors.dob.message}</span>
            )}
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="email">Email Address</label>
            <input
              id="email"
              type="email"
              className="form-input"
              placeholder="name@example.com"
              {...register('email')}
            />
            {errors.email && (
              <span className="error-message">{errors.email.message}</span>
            )}
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="password">Password</label>
            <div style={{ position: 'relative' }}>
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                className="form-input"
                placeholder="••••••••"
                style={{ paddingRight: '3rem' }}
                {...register('password')}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute',
                  right: '0.75rem',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: '#92400e',
                  fontSize: '0.85rem',
                  padding: 0
                }}
              >
                {showPassword ? 'Hide' : 'Show'}
              </button>
            </div>
            {errors.password && (
              <span className="error-message">{errors.password.message}</span>
            )}
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="confirmPassword">Confirm Password</label>
            <div style={{ position: 'relative' }}>
              <input
                id="confirmPassword"
                type={showConfirm ? 'text' : 'password'}
                className="form-input"
                placeholder="••••••••"
                style={{ paddingRight: '3rem' }}
                {...register('confirmPassword')}
              />
              <button
                type="button"
                onClick={() => setShowConfirm(!showConfirm)}
                style={{
                  position: 'absolute',
                  right: '0.75rem',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: '#92400e',
                  fontSize: '0.85rem',
                  padding: 0
                }}
              >
                {showConfirm ? 'Hide' : 'Show'}
              </button>
            </div>
            {errors.confirmPassword && (
              <span className="error-message">{errors.confirmPassword.message}</span>
            )}
          </div>

          <button type="submit" className="btn-submit" disabled={loading}>
            {loading ? (
              <>
                <span className="spinner"></span>
                <span>Creating Account...</span>
              </>
            ) : (
              'Sign Up'
            )}
          </button>
        </form>
        <div className="auth-footer">
          Already have an account? <Link to="/login">Log In</Link>
        </div>
      </div>
    </div>
  );
};

export default Signup;