import React, { useState, useEffect } from 'react';
import { ArrowLeft, User, Mail, Lock, Calendar, Edit2, Eye, EyeOff, Database, ChevronDown } from 'lucide-react';
import { supabase } from '../../utils/supabase';
import { useUser } from '../../contexts/UserContext';

interface ProfilePageProps {
  onBack: () => void;
  profileImage: string;
  onLogout: () => void;
  email?: string;
  username?: string;
}

export default function ProfilePage({ onBack, profileImage, onLogout, email = 'youremail@gmail.com', username = 'patchara123' }: ProfilePageProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showDatabaseInfo, setShowDatabaseInfo] = useState(false);
  const [databaseData, setDatabaseData] = useState<any>(null);
  const [isLoadingData, setIsLoadingData] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>(profileImage);
  const [isSaving, setIsSaving] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [currentPassword, _setCurrentPassword] = useState('password123');
  const { updateUserInfo } = useUser();
  
  const [formData, setFormData] = useState({
    email: email,
    username: username,
    gender: 'Male',
    age: '22'
  });

  const handleLogout = () => {
    onLogout();
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleViewDatabaseInfo = async () => {
    setIsLoadingData(true);
    setShowDatabaseInfo(true);
    
    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        alert('กรุณาเข้าสู่ระบบก่อน');
        setIsLoadingData(false);
        return;
      }

      // Resolve Supabase project and key from environment
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
      const publicAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;
      const resolvedProjectId = supabaseUrl ? new URL(supabaseUrl).hostname.split('.')[0] : undefined;

      if (!resolvedProjectId || !publicAnonKey) {
        setDatabaseData({ error: 'ไม่สามารถดึงข้อมูลได้', details: 'Missing Supabase configuration' });
        setIsLoadingData(false);
        return;
      }

      // Fetch user data from backend
      const response = await fetch(
        `https://${resolvedProjectId}.supabase.co/functions/v1/make-server-bc2f46a2/user-info/${user.id}`,
        {
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setDatabaseData(data);
        console.log('Database Data:', data);
      } else {
        const errorText = await response.text();
        console.error('Error fetching database info:', errorText);
        setDatabaseData({ error: 'ไม่สามารถดึงข้อมูลได้', details: errorText });
      }
    } catch (error) {
      console.error('Error:', error);
      setDatabaseData({ error: 'เกิดข้อผิดพลาด', details: String(error) });
    }
    
    setIsLoadingData(false);
  };

  // Handle file selection and preview
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    if (file) {
      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  useEffect(() => {
    return () => {
      if (previewUrl && previewUrl.startsWith('blob:')) {
        try { URL.revokeObjectURL(previewUrl); } catch {}
      }
    };
  }, [previewUrl]);

  // Save profile: upload avatar if selected and upsert profile data
  const saveProfile = async () => {
    setIsSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        alert('กรุณาเข้าสู่ระบบก่อน');
        setIsSaving(false);
        return;
      }

      let avatarUrl = previewUrl;

      if (selectedFile) {
        try {
          const path = `avatars/${user.id}-${Date.now()}-${selectedFile.name}`;
          // @ts-ignore
          const { data: uploadData, error: uploadError } = await supabase.storage.from('avatars').upload(path, selectedFile, { upsert: true });
          if (uploadError) throw uploadError;
          // get public URL
          // @ts-ignore
          const { data: publicData } = supabase.storage.from('avatars').getPublicUrl(path);
          avatarUrl = publicData?.publicUrl ?? avatarUrl;
        } catch (err) {
          console.error('Avatar upload failed:', err);
        }
      }

      // If user wants to change password, update auth first
      if (newPassword) {
        try {
          const { error: pwError } = await supabase.auth.updateUser({ password: newPassword });
          if (pwError) {
            console.error('Failed to update password:', pwError);
            alert('ไม่สามารถเปลี่ยนรหัสผ่านได้');
            setIsSaving(false);
            return;
          }
        } catch (err) {
          console.error('Password update error:', err);
          alert('ไม่สามารถเปลี่ยนรหัสผ่านได้');
          setIsSaving(false);
          return;
        }
      }

      const payload = {
        user_id: user.id,
        email: formData.email,
        username: formData.username,
        gender: formData.gender?.toLowerCase?.() ?? formData.gender,
        age: formData.age,
        avatar_url: avatarUrl,
      } as any;

      const { error: upsertError } = await supabase.from('user_profile').upsert([payload]);
      if (upsertError) {
        console.error('Failed to save profile:', upsertError);
        alert('เกิดข้อผิดพลาดขณะบันทึกข้อมูล');
      } else {
        alert('บันทึกข้อมูลเรียบร้อยแล้ว');
        setIsEditing(false);
        // Ensure UI shows the latest avatar and clear selected file
        setPreviewUrl(avatarUrl);
        setSelectedFile(null);
        setNewPassword('');
        // Update user context so other parts of the app show latest info
        try {
          updateUserInfo({
            username: formData.username,
            gender: (formData.gender || '').toLowerCase() as any,
            age: formData.age,
          });
        } catch (e) { /* ignore */ }
      }
    } catch (err) {
      console.error(err);
      alert('เกิดข้อผิดพลาด');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 w-screen bg-gradient-to-b from-emerald-50 to-white flex flex-col overflow-y-auto">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-emerald-100/50 shadow-sm">
        <div className="container mx-auto px-6 py-20 max-w-6xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button onClick={onBack} className="p-2 rounded-lg hover:bg-emerald-50 transition-all duration-200 text-emerald-600 hover:text-emerald-700">
                <ArrowLeft className="w-6 h-6" />
              </button>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-emerald-500 bg-clip-text text-transparent">My Profile</h1>
                <p className="text-sm text-gray-500 mt-1">Manage and customize your account</p>
              </div>
            </div>
            <button onClick={handleLogout} className="px-5 py-2.5 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 font-semibold transition-all duration-200 border border-red-200">Sign Out</button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 container mx-auto px-6 py-8 max-w-6xl">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          {/* Left: Avatar Section */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-3xl shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden border border-emerald-50">
              <div className="relative aspect-square bg-gradient-to-br from-emerald-50 to-emerald-100/50 flex flex-col items-center justify-center p-8">
                <div className="relative mb-6">
                  <div className="w-48 h-48 rounded-full overflow-hidden ring-8 ring-emerald-100 shadow-2xl">
                    <img src={previewUrl || profileImage} alt="avatar" className="w-full h-full object-cover" />
                  </div>
                  <input id="avatarInput" type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
                  {isEditing ? (
                    <label htmlFor="avatarInput" className="absolute right-2 bottom-2 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-700 hover:to-emerald-600 text-white rounded-full p-3 -mb-1 -mr-1 cursor-pointer shadow-lg hover:shadow-xl transition-all duration-200">
                      <span className="text-xl font-bold">+</span>
                    </label>
                  ) : (
                    <button onClick={() => setIsEditing(true)} className="absolute right-2 bottom-2 bg-white rounded-full p-3 -mb-1 -mr-1 shadow-lg hover:shadow-xl hover:bg-emerald-50 transition-all duration-200 border-2 border-emerald-100">
                      <Edit2 className="w-6 h-6 text-emerald-600" />
                    </button>
                  )}
                </div>
                <div className="text-center mt-4 w-full px-4">
                  <h2 className="text-2xl font-bold text-gray-800 truncate">{formData.username}</h2>
                  <p className="text-sm text-gray-500 mt-1 truncate">{formData.email}</p>
                  <div className="mt-4 flex justify-center gap-2">
                    <div className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-700 text-xs font-semibold">Age: {formData.age}</div>
                    <div className="px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-xs font-semibold">{formData.gender}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Form Section */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-3xl shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden border border-emerald-50">
              <div className="bg-gradient-to-r from-emerald-600 to-emerald-500 px-8 py-6">
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                  <span className="text-2xl"></span> Profile Information
                </h3>
              </div>
              
              <div className="p-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Email */}
                  <div className="md:col-span-1">
                    <label className="text-sm font-semibold text-gray-700 flex items-center gap-2 mb-3">
                      <Mail className="w-5 h-5 text-emerald-500" /> Email
                    </label>
                    <input 
                      type="email" 
                      value={formData.email} 
                      onChange={(e) => handleInputChange('email', e.target.value)} 
                      readOnly={!isEditing} 
                      className={`w-full px-5 py-3.5 rounded-xl border-2 transition-all duration-200 font-medium ${isEditing ? 'border-emerald-300 bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 outline-none' : 'border-gray-200 bg-gray-50 cursor-not-allowed text-gray-600'}`} 
                    />
                  </div>

                  {/* Username */}
                  <div className="md:col-span-1">
                    <label className="text-sm font-semibold text-gray-700 flex items-center gap-2 mb-3">
                      <User className="w-5 h-5 text-emerald-500" /> Username
                    </label>
                    <input 
                      type="text" 
                      value={formData.username} 
                      onChange={(e) => handleInputChange('username', e.target.value)} 
                      readOnly={!isEditing} 
                      className={`w-full px-5 py-3.5 rounded-xl border-2 transition-all duration-200 font-medium ${isEditing ? 'border-emerald-300 bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 outline-none' : 'border-gray-200 bg-gray-50 cursor-not-allowed text-gray-600'}`} 
                    />
                  </div>

                  {/* Age */}
                  <div className="md:col-span-1">
                    <label className="text-sm font-semibold text-gray-700 flex items-center gap-2 mb-3">
                      <Calendar className="w-5 h-5 text-emerald-500" /> Age
                    </label>
                    <input 
                      type="number" 
                      value={formData.age} 
                      onChange={(e) => handleInputChange('age', e.target.value)} 
                      readOnly={!isEditing} 
                      className={`w-full px-5 py-3.5 rounded-xl border-2 transition-all duration-200 font-medium ${isEditing ? 'border-emerald-300 bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 outline-none' : 'border-gray-200 bg-gray-50 cursor-not-allowed text-gray-600'}`} 
                    />
                  </div>

                 {/* Gender */}
                <div className="md:col-span-1">
                  <label className="text-sm font-semibold text-gray-700 flex items-center gap-2 mb-3">
                    <User className="w-5 h-5 text-emerald-500" /> Gender
                  </label>

                <div className="relative">
                  <select 
                    value={formData.gender} 
                    onChange={(e) => handleInputChange('gender', e.target.value)} 
                    disabled={!isEditing} 
                    className={`w-full px-4 py-3.5 pr-12 rounded-xl border-2 transition-all duration-200 font-medium appearance-none
                    ${isEditing 
                    ? 'border-emerald-300 bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 outline-none' 
                    : 'border-gray-200 bg-gray-50 cursor-not-allowed text-gray-600'
                  }`}
                  >
                  <option value="Male">Male ♂</option>
                  <option value="Female">Female ♀</option>
                  <option value="Other">Other</option>
                  </select>

                  {/* Arrow */}
                <ChevronDown className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  </div>
                  </div>

                  {/* Password Section */}
                  <div className="md:col-span-2">
                    <label className="text-sm font-semibold text-gray-700 flex items-center gap-2 mb-3">
                      <Lock className="w-5 h-5 text-emerald-500" /> Password
                    </label>
                    <div className="flex gap-3 items-center">
                      <input 
                        type={showCurrentPassword ? 'text' : 'password'} 
                        value={showCurrentPassword ? currentPassword : '••••••••'} 
                        readOnly 
                        className="flex-1 px-5 py-3.5 rounded-xl border-2 border-gray-200 bg-gray-50 cursor-not-allowed font-medium text-gray-600" 
                      />
                      <button 
                        type="button" 
                        onClick={() => setShowCurrentPassword(!showCurrentPassword)} 
                        className="px-4 py-3.5 rounded-lg bg-emerald-50 border-2 border-emerald-300 hover:bg-emerald-100 transition-all duration-200"
                      >
                        {showCurrentPassword ? <EyeOff className="w-5 h-5 text-emerald-600"/> : <Eye className="w-5 h-5 text-emerald-600"/>}
                      </button>
                    </div>
                    {isEditing && (
                      <div className="mt-3">
                        <input 
                          type="password" 
                          placeholder="New password (optional)" 
                          value={newPassword} 
                          onChange={(e) => setNewPassword(e.target.value)} 
                          className="w-full px-5 py-3.5 rounded-xl border-2 border-emerald-300 bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 outline-none font-medium" 
                        />
                      </div>
                    )}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="mt-8 space-y-3">
                  {isEditing ? (
                    <div className="flex gap-3">
                      <button 
                        onClick={() => { setIsEditing(false); setSelectedFile(null); setPreviewUrl(profileImage); }} 
                        className="flex-1 py-3.5 px-6 rounded-xl border-2 border-gray-300 hover:bg-gray-50 transition-all duration-200 font-semibold text-gray-700"
                      >
                        Cancel
                      </button>
                      <button 
                        onClick={saveProfile} 
                        disabled={isSaving} 
                        className="flex-1 py-3.5 px-6 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-500 text-white hover:from-emerald-700 hover:to-emerald-600 disabled:opacity-60 font-semibold transition-all duration-200 shadow-lg hover:shadow-xl"
                      >
                        {isSaving ? 'Saving...' : 'Save Changes'}
                      </button>
                    </div>
                  ) : (
                    <>
                      <p className="text-sm text-gray-500 text-center font-medium">💡 Click the pencil icon to start editing</p>
                      <button 
                        onClick={() => setIsEditing(true)} 
                        className="w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-500 text-white hover:from-emerald-700 hover:to-emerald-600 font-semibold transition-all duration-200 shadow-lg hover:shadow-xl"
                      >
                        Edit Profile
                      </button>
                      <button 
                        onClick={handleViewDatabaseInfo} 
                        disabled={isLoadingData}
                        className="w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 text-white hover:from-blue-700 hover:to-blue-600 disabled:opacity-60 font-semibold transition-all duration-200 shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
                      >
                        <Database className="w-5 h-5" />
                        {isLoadingData ? 'Loading...' : 'View Database Info'}
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

        {/* Database Info Modal */}
      {showDatabaseInfo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden flex flex-col animate-in">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-emerald-600 to-emerald-500 p-8">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center border border-white/30">
                    <Database className="w-7 h-7 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-white">Database Information</h2>
                    <p className="text-emerald-100 text-sm mt-1">Your stored profile data</p>
                  </div>
                </div>
                <button onClick={() => setShowDatabaseInfo(false)} className="text-white hover:bg-white/20 rounded-full p-2 transition-all duration-200 backdrop-blur-sm">
                  <span className="text-2xl">✕</span>
                </button>
              </div>
            </div>

            {/* Modal Content */}
            <div className="flex-1 overflow-y-auto p-8">
              {isLoadingData ? (
                <div className="flex items-center justify-center py-16">
                  <div className="text-center">
                    <div className="w-16 h-16 border-4 border-emerald-300 border-t-emerald-600 rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-600 font-semibold">Loading data...</p>
                  </div>
                </div>
              ) : databaseData?.error ? (
                <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-6">
                  <p className="text-red-700 font-bold text-lg mb-2">❌ {databaseData.error}</p>
                  <p className="text-sm text-red-600">{databaseData.details}</p>
                </div>
              ) : databaseData ? (
                <div className="space-y-6">
                  {databaseData.userInfo && (
                    <div className="bg-gradient-to-br from-emerald-50 to-emerald-100/50 border-2 border-emerald-200 rounded-2xl p-6">
                      <h3 className="text-lg font-bold text-emerald-800 mb-4 flex items-center gap-2">👤 Personal Information</h3>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-white rounded-xl p-4 border border-emerald-100">
                          <p className="text-xs font-semibold text-gray-500 mb-2 uppercase">Username</p>
                          <p className="font-bold text-gray-800 text-lg">{databaseData.userInfo.username || '-'}</p>
                        </div>
                        <div className="bg-white rounded-xl p-4 border border-emerald-100">
                          <p className="text-xs font-semibold text-gray-500 mb-2 uppercase">Email</p>
                          <p className="font-bold text-gray-800 text-sm">{databaseData.userInfo.email || '-'}</p>
                        </div>
                      </div>
                    </div>
                  )}
                  <details className="bg-gray-50 border-2 border-gray-200 rounded-2xl p-6 group">
                    <summary className="font-bold text-gray-800 cursor-pointer text-lg flex items-center gap-2 group-open:text-emerald-600">
                      <span>🔧</span> View JSON Data
                    </summary>
                    <pre className="mt-4 text-xs text-gray-700 bg-white rounded-xl p-4 overflow-x-auto border border-gray-200 font-mono">{JSON.stringify(databaseData, null, 2)}</pre>
                  </details>
                </div>
              ) : (
                <div className="text-center py-16">
                  <p className="text-gray-500 text-lg font-semibold">No data found</p>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="border-t border-gray-200 p-6 bg-gray-50/50">
              <button onClick={() => setShowDatabaseInfo(false)} className="w-full py-3.5 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-700 hover:to-emerald-600 text-white font-semibold transition-all duration-200 shadow-lg hover:shadow-xl">
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}