import React, { useState } from 'react';
import { Upload, Youtube, CheckCircle, AlertCircle } from 'lucide-react';
import { userDb } from '../services/db';
import { ClassContent } from '../types';

const AdminUpload: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [formData, setFormData] = useState({
    title: '',
    subject: '',
    batchId: '10',
    videoUrl: '',
    description: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSuccess('');

    // Basic Youtube URL validation/formatting
    // Converts "watch?v=" to "embed/" for iframe support
    let finalUrl = formData.videoUrl;
    if (finalUrl.includes('watch?v=')) {
      finalUrl = finalUrl.replace('watch?v=', 'embed/');
    } else if (finalUrl.includes('youtu.be/')) {
      finalUrl = finalUrl.replace('youtu.be/', 'youtube.com/embed/');
    }

    const newContent: ClassContent = {
      id: Date.now().toString(),
      title: formData.title,
      subject: formData.subject,
      batchId: formData.batchId,
      videoUrl: finalUrl,
      description: formData.description,
      timestamp: Date.now()
    };

    await userDb.saveClassContent(newContent);
    
    setLoading(false);
    setSuccess('Class uploaded successfully!');
    setFormData({ ...formData, title: '', videoUrl: '', description: '' }); // Reset form
  };

  return (
    <div className="pb-20">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-6 border-b border-gray-100 bg-gray-50">
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <Upload className="text-primary" /> Upload New Class
          </h1>
          <p className="text-gray-500 text-sm">Add educational videos for students.</p>
        </div>

        <div className="p-6">
          {success && (
            <div className="mb-6 p-4 bg-green-50 text-green-700 rounded-lg flex items-center gap-2 border border-green-200">
              <CheckCircle size={20} /> {success}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Class Title</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={e => setFormData({...formData, title: e.target.value})}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary outline-none"
                  placeholder="e.g. Algebra Chapter 1"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
                <input
                  type="text"
                  required
                  value={formData.subject}
                  onChange={e => setFormData({...formData, subject: e.target.value})}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary outline-none"
                  placeholder="e.g. Mathematics"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Select Batch</label>
                <select
                  value={formData.batchId}
                  onChange={e => setFormData({...formData, batchId: e.target.value})}
                  className="w-full p-2 border border-gray-300 rounded-lg bg-white"
                >
                  <option value="8">Class 8</option>
                  <option value="9">Class 9</option>
                  <option value="10">Class 10</option>
                  <option value="11">Class 11</option>
                  <option value="12">Class 12</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">YouTube Video Link</label>
                <div className="relative">
                  <Youtube className="absolute left-3 top-2.5 text-gray-400" size={18} />
                  <input
                    type="url"
                    required
                    value={formData.videoUrl}
                    onChange={e => setFormData({...formData, videoUrl: e.target.value})}
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary outline-none"
                    placeholder="https://youtube.com/watch?v=..."
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea
                required
                rows={3}
                value={formData.description}
                onChange={e => setFormData({...formData, description: e.target.value})}
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary outline-none"
                placeholder="Brief summary of the lesson..."
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary text-white py-3 rounded-lg font-bold hover:bg-blue-600 transition shadow-md flex justify-center items-center gap-2"
            >
              {loading ? 'Uploading...' : 'Publish Class'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AdminUpload;