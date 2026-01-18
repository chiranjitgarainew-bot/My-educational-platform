import React, { useState, useEffect, useRef } from 'react';
import { User } from '../types';
import { Edit2, Save, X, MapPin, Calendar, Phone, Mail, User as UserIcon, Home, Camera } from 'lucide-react';

interface ProfileProps {
  user: User;
  onUpdateUser: (updatedUser: User) => void;
}

const Profile: React.FC<ProfileProps> = ({ user, onUpdateUser }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<User>(user);
  const [previewAvatar, setPreviewAvatar] = useState<string | undefined>(user.avatar);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setFormData(user);
    setPreviewAvatar(user.avatar);
  }, [user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setPreviewAvatar(base64String);
        setFormData(prev => ({ ...prev, avatar: base64String }));
      };
      reader.readAsDataURL(file);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const handleSave = () => {
    onUpdateUser(formData);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setFormData(user);
    setPreviewAvatar(user.avatar);
    setIsEditing(false);
  };

  const InputField = ({ label, name, icon: Icon, type = "text", placeholder }: any) => (
    <div className="mb-4">
      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">
        {label}
      </label>
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
          <Icon size={18} />
        </div>
        <input
          type={type}
          name={name}
          value={(formData as any)[name] || ''}
          onChange={handleChange}
          disabled={!isEditing}
          placeholder={placeholder}
          className={`w-full pl-10 pr-3 py-2.5 rounded-lg border ${
            isEditing 
              ? 'border-gray-300 bg-white focus:ring-2 focus:ring-primary focus:border-transparent' 
              : 'border-transparent bg-gray-50 text-gray-700'
          } transition-all duration-200 outline-none`}
        />
      </div>
    </div>
  );

  return (
    <div className="pb-24">
      {/* Header / Cover */}
      <div className="relative mb-16">
        <div className="h-32 bg-gradient-to-r from-primary to-blue-600 rounded-xl shadow-md"></div>
        
        {/* Profile Card Overlay */}
        <div className="absolute top-16 left-0 right-0 flex justify-center">
          <div className="relative">
            <div className="w-32 h-32 rounded-full border-4 border-white shadow-lg overflow-hidden bg-white">
              <img 
                src={previewAvatar || user.avatar} 
                alt={user.name} 
                className="w-full h-full object-cover"
              />
            </div>
            {isEditing && (
              <>
                <button 
                  onClick={triggerFileInput}
                  className="absolute bottom-0 right-0 bg-gray-800 text-white p-2 rounded-full shadow-lg hover:bg-black transition"
                  title="Upload Photo"
                >
                  <Camera size={18} />
                </button>
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleImageUpload} 
                  accept="image/*" 
                  className="hidden" 
                />
              </>
            )}
          </div>
        </div>
      </div>

      <div className="text-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">{formData.name}</h1>
        <p className="text-gray-500">{formData.email}</p>
        <div className="mt-2 text-sm text-gray-600 max-w-sm mx-auto">
          {isEditing ? (
             <textarea
               name="bio"
               value={formData.bio || ''}
               onChange={handleChange}
               className="w-full p-2 border border-gray-300 rounded-lg text-center"
               rows={2}
               placeholder="Write a short bio..."
             />
          ) : (
            <p className="italic">"{formData.bio || 'No bio added yet.'}"</p>
          )}
        </div>
      </div>

      <div className="flex justify-center mb-8 gap-3">
        {isEditing ? (
          <>
            <button 
              onClick={handleSave}
              className="flex items-center gap-2 px-6 py-2 bg-primary text-white rounded-full shadow-lg hover:bg-blue-600 transition"
            >
              <Save size={18} /> Save Details
            </button>
            <button 
              onClick={handleCancel}
              className="flex items-center gap-2 px-6 py-2 bg-white text-gray-700 border border-gray-300 rounded-full hover:bg-gray-50 transition"
            >
              <X size={18} /> Cancel
            </button>
          </>
        ) : (
          <button 
            onClick={() => setIsEditing(true)}
            className="flex items-center gap-2 px-6 py-2 bg-white text-primary border border-primary rounded-full hover:bg-blue-50 transition shadow-sm"
          >
            <Edit2 size={18} /> Edit Profile
          </button>
        )}
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 border-b border-gray-100 bg-gray-50">
          <h3 className="font-bold text-gray-700 flex items-center gap-2">
            <UserIcon size={20} className="text-primary" /> Personal Information
          </h3>
        </div>
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-x-6">
           <InputField label="Full Name" name="name" icon={UserIcon} placeholder="Your full name" />
           <InputField label="Date of Birth" name="dob" icon={Calendar} type="date" placeholder="DD/MM/YYYY" />
           <InputField label="Phone Number" name="phone" icon={Phone} type="tel" placeholder="+91 98765 43210" />
           <InputField label="Email Address" name="email" icon={Mail} type="email" placeholder="you@example.com" />
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mt-6">
        <div className="p-4 border-b border-gray-100 bg-gray-50">
          <h3 className="font-bold text-gray-700 flex items-center gap-2">
            <MapPin size={20} className="text-primary" /> Address Details
          </h3>
        </div>
        <div className="p-6 grid grid-cols-1 gap-x-6">
           <InputField label="Village / Town" name="village" icon={Home} placeholder="e.g. Sonarpur" />
           <InputField label="Full Address" name="address" icon={MapPin} placeholder="e.g. 123 Main Street, West Bengal" />
        </div>
      </div>

    </div>
  );
};

export default Profile;