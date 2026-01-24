'use client';

import React, { useState, useRef, useEffect } from 'react';

/**
 * OTPInput component for 4-digit verification
 * @param {Object} props
 * @param {string} props.email - The email being verified
 * @param {function} props.onVerified - Callback on successful verification
 */
const OTPInput = ({ email, onVerified }) => {
  const [otp, setOtp] = useState(['', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const inputRefs = useRef([]);

  // Auto-verify when all 4 digits are filled
  useEffect(() => {
    if (otp.every((digit) => digit !== '') && otp.join('').length === 4) {
      handleVerify(otp.join(''));
    }
  }, [otp]);

  const handleChange = (e, index) => {
    const value = e.target.value;
    if (!/^\d*$/.test(value)) return; // Only allow digits

    const newOtp = [...otp];
    // Take only the last character if multiple are entered (shouldn't happen with max length)
    newOtp[index] = value.substring(value.length - 1);
    setOtp(newOtp);
    setError('');

    // Move focus forward
    if (value && index < 3) {
      inputRefs.current[index + 1].focus();
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === 'Backspace') {
      if (!otp[index] && index > 0) {
        // Move focus backward on backspace if current field is empty
        inputRefs.current[index - 1].focus();
      }
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const data = e.clipboardData.getData('text').trim();
    if (!/^\d{4}$/.test(data)) return;

    const newOtp = data.split('');
    setOtp(newOtp);
    inputRefs.current[3].focus();
  };

  const handleVerify = async (otpString) => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch('/api/otp/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp: otpString }),
      });

      const result = await response.json();

      if (response.ok) {
        setSuccess(true);
        if (onVerified) onVerified();
      } else {
        setError(result.error || 'Verification failed');
        // Clear OTP on error to let user retry
        setOtp(['', '', '', '']);
        inputRefs.current[0].focus();
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="otp-container">
      <div className="otp-inputs">
        {otp.map((digit, index) => (
          <input
            key={index}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={digit}
            ref={(el) => (inputRefs.current[index] = el)}
            onChange={(e) => handleChange(e, index)}
            onKeyDown={(e) => handleKeyDown(e, index)}
            onPaste={handlePaste}
            disabled={loading || success}
            className={`otp-field ${error ? 'error' : ''} ${success ? 'success' : ''}`}
            autoComplete="one-time-code"
          />
        ))}
      </div>

      {loading && <div className="otp-status loading">Verifying...</div>}
      {error && <div className="otp-status error">{error}</div>}
      {success && <div className="otp-status success">Verification Successful!</div>}

      <style jsx>{`
        .otp-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 1.5rem;
          padding: 1rem;
        }
        .otp-inputs {
          display: flex;
          gap: 0.75rem;
        }
        .otp-field {
          width: 3.5rem;
          height: 4rem;
          text-align: center;
          font-size: 1.5rem;
          font-weight: bold;
          border: 2px solid #e0e0e0;
          border-radius: 0.75rem;
          background: #fff;
          transition: all 0.2s ease;
          outline: none;
          color: #333;
        }
        .otp-field:focus {
          border-color: #007bff;
          box-shadow: 0 0 0 4px rgba(0, 123, 255, 0.1);
        }
        .otp-field.error {
          border-color: #dc3545;
          background-color: #fff8f8;
        }
        .otp-field.success {
          border-color: #28a745;
          background-color: #f8fff9;
        }
        .otp-field:disabled {
          background-color: #f8f9fa;
          cursor: not-allowed;
          opacity: 0.7;
        }
        .otp-status {
          font-size: 0.9rem;
          font-weight: 500;
          text-align: center;
        }
        .otp-status.loading {
          color: #007bff;
        }
        .otp-status.error {
          color: #dc3545;
        }
        .otp-status.success {
          color: #28a745;
        }
      `}</style>
    </div>
  );
};

export default OTPInput;
