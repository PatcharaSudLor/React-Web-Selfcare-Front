import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../utils/supabase.ts';

export default function ResetPasswordPage() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // when the recovery link redirects here it includes an access_token query
  // parameter. we need to feed that token to supabase so updateUser will see
  // a valid session. the SDK normally exposes getSessionFromUrl(), but its
  // typings were causing trouble earlier, and the method isn’t strictly
  // necessary – we can manually call setSession instead.
  
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('access_token');
    const type = params.get('type');

    if (token && type === 'recovery') {
      // ignore returned promise; if it fails, we'll handle on updateUser
      supabase.auth
        .setSession({ access_token: token, refresh_token: '' })
        .catch((e) => {
          console.warn('Failed to set session from token', e);
        });
    } else {
      // if no token, we can't really reset password
      setMessage('Invalid or expired reset link.');
    }
  }, []);

  // supabase-js automatically reads the access token from the URL when
  // you call updateUser; no manual parsing is required here, so this
  // effect can be removed.
  //
  // If you prefer explicitly extracting the token, use
  // `supabase.auth.getSessionFromUrl()` (available in v2+), but the
  // current SDK version here doesn't expose that method.
  //
  // useEffect(() => {}, []);

  const handleSubmit = async () => {
    setMessage('');

    if (!password) {
      setMessage('Please enter a new password');
      return;
    }
    if (password !== confirmPassword) {
      setMessage('Passwords do not match');
      return;
    }

    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password });
    setLoading(false);

    if (error) {
      setMessage(error.message);
    } else {
      setMessage('Password changed successfully. You may now log in.');
      setTimeout(() => navigate('/login'), 2000);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-white p-4">
      <div className="w-full max-w-md bg-white shadow-lg rounded-lg p-8">
        <h1 className="text-2xl font-semibold mb-6">Reset your password</h1>
        {message && <p className="text-sm text-red-600 mb-4">{message}</p>}
        {message !== 'Invalid or expired reset link.' && (
          <div className="space-y-4">
          <div>
            <label className="block text-sm text-gray-600 mb-2">New password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 border rounded"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-2">Confirm password</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-4 py-2 border rounded"
            />
          </div>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full py-2 bg-emerald-400 text-white rounded disabled:bg-emerald-200"
          >
            {loading ? 'Saving...' : 'Save new password'}
          </button>
        </div>
        )}
      </div>
    </div>
  );
}
