import React, { useState, useEffect } from 'react';
import { ArrowLeft, User, Mail, Lock, Calendar, Edit2, ChevronDown, Eye, EyeOff } from 'lucide-react';
import { supabase } from '../../utils/supabase';
import { useUser } from '../../contexts/UserContext';

function ProfileSkeleton() {
  return (
    <div className="fixed inset-0 w-screen
      bg-gradient-to-b from-emerald-50 to-white
      flex flex-col overflow-y-auto
      animate-pulse
      motion-safe:transition-opacity
      motion-safe:duration-500
      motion-safe:ease-out">
      {/* Header Skeleton */}
      <div className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-emerald-100/50 shadow-sm">
        <div className="container mx-auto px-6 py-20 max-w-6xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg bg-gray-200" />
              <div>
                <div className="h-6 w-40 bg-gray-200 rounded mb-2" />
                <div className="h-4 w-56 bg-gray-100 rounded" />
              </div>
            </div>
            <div className="h-10 w-28 bg-gray-200 rounded-lg" />
          </div>
        </div>
      </div>

      {/* Main Content Skeleton */}
      <div className="flex-1 container mx-auto px-6 py-8 max-w-6xl">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">

          {/* Avatar Skeleton */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-3xl shadow-lg border border-emerald-50 p-8 flex flex-col items-center">
              <div className="w-48 h-48 rounded-full bg-gray-200 mb-6" />
              <div className="h-6 w-40 bg-gray-200 rounded mb-2" />
              <div className="h-4 w-56 bg-gray-100 rounded mb-4" />
              <div className="flex gap-2">
                <div className="h-6 w-20 bg-gray-100 rounded-full" />
                <div className="h-6 w-20 bg-gray-100 rounded-full" />
              </div>
            </div>
          </div>

          {/* Form Skeleton */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-3xl shadow-lg border border-emerald-50 overflow-hidden">
              <div className="bg-emerald-500 h-16" />
              <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i}>
                    <div className="h-4 w-24 bg-gray-200 rounded mb-3" />
                    <div className="h-12 w-full bg-gray-100 rounded-xl" />
                  </div>
                ))}
              </div>

              <div className="px-8 pb-8">
                <div className="h-12 w-full bg-gray-200 rounded-xl" />
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

function getPasswordStrength(password: string) {
  let score = 0;
  if (password.length >= 8) score++;
  if (/[a-z]/.test(password)) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  return score; // 0-4
}

function getStrengthLabel(score: number) {
  switch (score) {
    case 0:
    case 1:
      return { label: 'Weak', color: 'bg-red-500', text: 'text-red-600' };
    case 2:
      return { label: 'Fair', color: 'bg-yellow-500', text: 'text-yellow-600' };
    case 3:
      return { label: 'Good', color: 'bg-blue-500', text: 'text-blue-600' };
    case 4:
      return { label: 'Strong', color: 'bg-emerald-500', text: 'text-emerald-600' };
    default:
      return { label: '', color: '', text: '' };
  }
}

interface ProfilePageProps {
  onBack: () => void;
  profileImage: string;
  onLogout: () => void;
  email?: string;
  username?: string;
}

export default function ProfilePage({ onBack, profileImage, onLogout }: ProfilePageProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>(profileImage);
  const [isSaving, setIsSaving] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const { updateUserInfo } = useUser();
  const [originalAvatar, setOriginalAvatar] = useState(profileImage);
  const [originalFormData, setOriginalFormData] = useState<typeof formData | null>(null);
  const [storedAvatarPath, setStoredAvatarPath] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const strength = getPasswordStrength(newPassword);
  const strengthInfo = getStrengthLabel(strength);

  const hasLower = /[a-z]/.test(newPassword);
  const hasUpper = /[A-Z]/.test(newPassword);
  const hasNumber = /[0-9]/.test(newPassword);
  const hasLength = newPassword.length >= 8;

  const isStrongPassword =
    hasLower && hasUpper && hasNumber && hasLength;

  

  const [formData, setFormData] = useState({
    email: '',
    username: '',
    gender: 'Male',
    age: '22',
    bloodType: 'O'
  });

  {/* Load profile data on mount */ }
  useEffect(() => {
    const loadProfile = async () => {
      setIsLoadingData(true);

      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) {
        setIsLoadingData(false);
        return;
      }
      const { data, error } = await supabase
        .from('user_profile')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (!error && data) {
        const loadedData = {
          email: user.email ?? '',
          username: data.username ?? '',
          gender: data.gender
            ? data.gender.charAt(0).toUpperCase() + data.gender.slice(1)
            : 'Male',
          age: data.age ? String(data.age) : '',
          bloodType: data.blood_type ?? 'O',
        };

        setFormData(loadedData);
        setOriginalFormData(loadedData);

        if (data.avatar_url) {
          setStoredAvatarPath(data.avatar_url);

          const { data: publicData } = supabase.storage
            .from('avatars')
            .getPublicUrl(data.avatar_url);

          const bustedUrl = `${publicData.publicUrl}?t=${Date.now()}`;

          setOriginalAvatar(bustedUrl);
          setPreviewUrl(bustedUrl);
        }
      }
      setIsLoadingData(false);
    }
    loadProfile();
  }, []);

  useEffect(() => {
    if (isEditing) {
      setNewPassword('');
    }
  }, [isEditing]);


  const handleLogout = () => {
    onLogout();
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
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
        try { URL.revokeObjectURL(previewUrl); } catch { }
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
      let avatarPath: string | null = storedAvatarPath;

      if (selectedFile) {
        const allowedTypes = ['image/png', 'image/jpeg', 'image/webp'];

        // ✅ เช็กชนิดไฟล์
        if (!allowedTypes.includes(selectedFile.type)) {
          alert('รองรับเฉพาะไฟล์รูปภาพเท่านั้น (png, jpg, webp)');
          setIsSaving(false);
          return;
        }

        // ✅ เช็กขนาดไฟล์ (ไม่เกิน 2MB)
        if (selectedFile.size > 2 * 1024 * 1024) {
          alert('ไฟล์ต้องมีขนาดไม่เกิน 2MB');
          setIsSaving(false);
          return;
        }

        const fileExt = selectedFile.name.split('.').pop();
        const filePath = `${user.id}/avatar.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from('avatars')
          .upload(filePath, selectedFile, { upsert: true });

        if (uploadError) {
          console.error(uploadError);
          alert('อัปโหลดรูปไม่สำเร็จ');
          setIsSaving(false);
          return;
        }

        avatarPath = filePath; // ✅ เก็บ path
      }

      // If user wants to change password, update auth first
      const trimmedPassword = newPassword.trim();

      if (isActuallyChangingPassword) {
        if (!isStrongPassword) {
          setPasswordError('Password must be Strong');
          setIsSaving(false);
          return;
        }

        if (trimmedPassword !== confirmPassword) {
          setPasswordError('Passwords do not match');
          setIsSaving(false);
          return;
        }

        const { error: pwError } = await supabase.auth.updateUser({
          password: trimmedPassword,
        });

        if (pwError) {
          alert('ไม่สามารถเปลี่ยนรหัสผ่านได้');
          setIsSaving(false);
          return;
        }
      }

      const payload = {
        username: formData.username,
        gender: formData.gender?.toLowerCase?.() ?? formData.gender,
        age: formData.age ? Number(formData.age) : null,
        blood_type: formData.bloodType,
        is_setup_completed: true,
      } as any;

      // ใส่ email แค่ครั้งแรก หรือถ้ายัง null
      if (!originalFormData?.email) {
        payload.email = user.email;
      }

      // ใส่ avatar เฉพาะเมื่อมีค่า
      if (avatarPath) {
        payload.avatar_url = avatarPath;
      }

      const { error: updateError } = await supabase.from('user_profile').update(payload).eq('user_id', user.id);
      if (updateError) {
        console.error('Failed to save profile:', updateError);
        alert('เกิดข้อผิดพลาดขณะบันทึกข้อมูล');
      } else {
        alert('บันทึกข้อมูลเรียบร้อยแล้ว');
        setIsEditing(false);
        setOriginalFormData({
          ...formData,
          email: user.email ?? '',
        });
        if (avatarPath) {
          const { data: publicData } = supabase.storage
            .from('avatars')
            .getPublicUrl(avatarPath);

          const bustedUrl = `${publicData.publicUrl}?t=${Date.now()}`;

          setOriginalAvatar(bustedUrl);
          setPreviewUrl(bustedUrl);

          updateUserInfo({
            avatarUrl: bustedUrl,
          });
        }
        setSelectedFile(null);
        setNewPassword('');
        // Update user context so other parts of the app show latest info
        try {
          updateUserInfo({
            username: formData.username,
            gender: (formData.gender || '').toLowerCase() as any,
            age: formData.age,
            bloodType: formData.bloodType,
            avatarUrl: avatarPath
              ? `${supabase.storage.from('avatars').getPublicUrl(avatarPath).data.publicUrl}?t=${Date.now()}`
              : undefined,
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

  const isProfileChanged = () => {
    if (!originalFormData) return false;

    return (
      formData.username !== originalFormData.username ||
      formData.gender !== originalFormData.gender ||
      formData.age !== originalFormData.age ||
      formData.bloodType !== originalFormData.bloodType ||
      selectedFile !== null
    );
  };

  const isActuallyChangingPassword =
    isChangingPassword && newPassword.trim().length > 0;

  const canSave =
    // 1️⃣ แก้ profile อย่างเดียว (ไม่แตะ password)
    (isProfileChanged() && !isActuallyChangingPassword)

    ||

    // 2️⃣ เปลี่ยน password (ต้อง strong)
    (isActuallyChangingPassword && isStrongPassword);

  if (isLoadingData) {
    return <ProfileSkeleton />;
  }

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
                <h1 className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-emerald-500 bg-clip-text text-transparent text-left">My Profile</h1>
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
                      readOnly
                      className={`w-full px-5 py-3.5 rounded-xl border-2 transition-all duration-200 font-medium`}
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
                  <div className="md:col-span-1">
                    <label className="text-sm font-semibold text-gray-700 flex items-center gap-2 mb-3">
                      <Lock className="w-5 h-5 text-emerald-500" /> Password
                    </label>
                    <div className="flex gap-3 items-center">
                      <input
                        type="password"
                        autoComplete="off"
                        value="••••••••"
                        readOnly
                        className="flex-1 px-5 py-3.5 rounded-xl border-2 border-gray-200 bg-gray-50 cursor-not-allowed font-medium text-gray-600"
                      />
                    </div>
                    {isEditing && !isChangingPassword && (
                      <>
                        <button
                          type="button"
                          onClick={() => setIsChangingPassword(true)}
                          className="mt-3 block text-left text-sm font-semibold text-emerald-600
                                     hover:text-emerald-700 hover:underline transition"
                        >
                          Change password
                        </button>

                      </>
                    )}
                    {isEditing && isChangingPassword && (
                      <div>
                        <div className="relative ">
                          <input
                            type={showPassword ? 'text' : 'password'}
                            name="new-password"
                            autoComplete="new-password"
                            placeholder="New password (optional)"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            className="w-full px-5 py-3.5 rounded-xl border-2 border-emerald-300 bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 outline-none font-medium"
                          />

                          <button
                            type="button"
                            onClick={() => setShowPassword(prev => !prev)}
                            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                          >
                            {showPassword ? (
                              <EyeOff className="w-5 h-5" />
                            ) : (
                              <Eye className="w-5 h-5" />
                            )}
                          </button>
                        </div>

                        {newPassword && (
                          <div className="mt-2 min-h-[72px] transition-all duration-300">
                            {/* Strength bar */}
                            <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                              <div
                                className={`h-full transition-all duration-300 ${strengthInfo.color}`}
                                style={{ width: `${(strength / 4) * 100}%` }}
                              />
                            </div>

                            <p className={`mt-1 text-xs font-semibold ${strengthInfo.text}`}>
                              {strengthInfo.label}
                            </p>

                            {/* Checklist */}
                            <ul
                              className={`mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs transition-all ${
                                isStrongPassword ? 'opacity-0 max-h-0 overflow-hidden' : 'opacity-100 max-h-20'
                              }`}
                            >
                              <li className={hasLower ? 'text-emerald-600' : 'text-gray-400'}>
                                ✓ lowercase
                              </li>
                              <li className={hasUpper ? 'text-emerald-600' : 'text-gray-400'}>
                                ✓ uppercase
                              </li>
                              <li className={hasNumber ? 'text-emerald-600' : 'text-gray-400'}>
                                ✓ number
                              </li>
                              <li className={hasLength ? 'text-emerald-600' : 'text-gray-400'}>
                                ✓ 8+ chars
                              </li>
                            </ul>

                            {isStrongPassword && (
                              <p className="mt-2 text-xs text-left font-semibold text-emerald-600">
                                ✓ Strong password
                              </p>
                            )}
                          </div>
                        )}

                        {/* Confirm Password */}
                        <div className="relative">
                          <input
                            type={showPassword ? 'text' : 'password'}
                            name="confirm-password"
                            placeholder="Confirm new password"
                            value={confirmPassword}
                            onChange={(e) => {
                              setConfirmPassword(e.target.value);
                              setPasswordError('');
                            }}
                            className="w-full px-5 py-3.5 rounded-xl border-2 border-emerald-300 bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 outline-none font-medium"
                          />

                          <button
                            type="button"
                            onClick={() => setShowPassword(prev => !prev)}
                            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                          >
                            {showPassword ? (
                              <EyeOff className="w-5 h-5" />
                            ) : (
                              <Eye className="w-5 h-5" />
                            )}
                          </button>
                        </div>

                        {/* Error Message */}
                        {passwordError && (
                          <p className="mt-2 text-sm text-red-500 font-medium">
                            {passwordError}
                          </p>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Blood Type */}
                  <div className="md:col-span-1">
                    <label className="text-sm font-semibold text-gray-700 flex items-center gap-2 mb-3">
                      <User className="w-5 h-5 text-emerald-500" /> Blood Type
                    </label>

                    <div className="relative">
                      <select
                        value={formData.bloodType}
                        onChange={(e) => handleInputChange('bloodType', e.target.value)}
                        disabled={!isEditing}
                        className={`w-full px-4 py-3.5 pr-12 rounded-xl border-2 transition-all duration-200 font-medium appearance-none
                    ${isEditing
                            ? 'border-emerald-300 bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 outline-none'
                            : 'border-gray-200 bg-gray-50 cursor-not-allowed text-gray-600'
                          }`}
                      >
                        <option value="A">A</option>
                        <option value="A+">A+</option>
                        <option value="A-">A-</option>
                        <option value="B">B</option>
                        <option value="B+">B+</option>
                        <option value="B-">B-</option>
                        <option value="AB">AB</option>
                        <option value="AB+">AB+</option>
                        <option value="AB-">AB-</option>
                        <option value="O">O</option>
                        <option value="O+">O+</option>
                        <option value="O-">O-</option>
                      </select>

                      {/* Arrow */}
                      <ChevronDown className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="md:col-span-2 w-full mt-8">
                    {isEditing ? (
                      <div className="flex gap-3">
                        {/* Cancel Button */}
                        <button
                          onClick={() => {
                            setIsEditing(false);
                            setIsChangingPassword(false);
                            setConfirmPassword('');
                            setPasswordError('');
                            setSelectedFile(null);
                            setPreviewUrl(originalAvatar);
                            if (originalFormData) {
                              setFormData(originalFormData);
                            }
                            setNewPassword('');
                          }}
                          className="flex-1 py-3.5 px-6 rounded-xl border-2 border-gray-300 hover:bg-gray-50 transition-all duration-200 font-semibold text-gray-700"
                        >
                          Cancel
                        </button>

                        {/* Save Button */}
                        <button
                          onClick={saveProfile}
                          disabled={isSaving || !canSave}
                          className="flex-1 py-3.5 px-6 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-500 text-white hover:from-emerald-700 hover:to-emerald-600 disabled:opacity-60 font-semibold transition-all duration-200 shadow-lg hover:shadow-xl"
                        >
                          {isSaving ? 'Saving...' : 'Save Changes'}
                        </button>
                      </div>
                    ) : (
                      <div className="w-full flex flex-col gap-3">
                        {/* 👆 ข้อความอยู่ด้านบนปุ่ม */}
                        <p className="text-sm text-gray-500 text-center font-medium">
                          💡 Click the pencil icon to start editing
                        </p>

                        <button
                          onClick={() => setIsEditing(true)}
                          className="w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-500 text-white hover:from-emerald-700 hover:to-emerald-600 font-semibold transition-all duration-200 shadow-lg hover:shadow-xl"
                        >
                          Edit Profile
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}