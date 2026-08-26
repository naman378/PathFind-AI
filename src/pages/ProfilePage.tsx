import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { SkillBar } from '../components/common/SkillBar';
import { UserAvatar } from '../components/common/UserAvatar';
import { uploadUserAvatar } from '../services/avatarStorageService';
import { ExperienceLevel, LearningStyle, PreferredDifficulty } from '../types';
import {
  User,
  GraduationCap,
  Target,
  Clock,
  BookOpen,
  Sparkles,
  Save,
  Download,
  Flame,
  CheckCircle2,
  Sliders,
  Award,
  Camera,
  Trash2,
} from 'lucide-react';

export const ProfilePage: React.FC = () => {
  const { profile, updateProfile, updateSkillProficiency, addToast, setCurrentPage, firebaseUser } = useApp();

  const [isEditing, setIsEditing] = useState(false);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [name, setName] = useState(profile.name);
  const [education, setEducation] = useState(profile.education);
  const [careerGoal, setCareerGoal] = useState(profile.careerGoal);
  const [experienceLevel, setExperienceLevel] = useState<ExperienceLevel>(profile.experienceLevel);
  const [weeklyHours, setWeeklyHours] = useState(profile.weeklyHours);
  const [preferredLearningStyle, setPreferredLearningStyle] = useState<LearningStyle>(profile.preferredLearningStyle);
  const [preferredDifficulty, setPreferredDifficulty] = useState<PreferredDifficulty>(profile.preferredDifficulty);

  const handlePhotoUpload = async (file: File) => {
    setIsUploadingPhoto(true);
    try {
      const userId = firebaseUser?.uid || profile.id || 'current-user';
      const uploadedUrl = await uploadUserAvatar(userId, file);
      await updateProfile({ avatarUrl: uploadedUrl });
      addToast('Profile picture updated successfully!', 'success');
    } catch (error: any) {
      console.error('Failed to upload profile picture:', error);
      addToast(error?.message || 'Could not upload profile picture. Please try another image.', 'error');
    } finally {
      setIsUploadingPhoto(false);
    }
  };

  const handleRemoveCustomPhoto = async () => {
    try {
      await updateProfile({ avatarUrl: '' });
      if (firebaseUser?.photoURL) {
        addToast('Custom photo removed. Restored Google profile photo.', 'info');
      } else {
        addToast('Profile photo removed. Initial avatar restored.', 'info');
      }
    } catch (error) {
      console.error('Error removing custom photo:', error);
      addToast('Could not remove photo.', 'error');
    }
  };

  const handleSave = () => {
    updateProfile({
      name,
      education,
      careerGoal,
      experienceLevel,
      weeklyHours,
      preferredLearningStyle,
      preferredDifficulty,
    });
    setIsEditing(false);
  };

  const handleExportRoadmap = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(profile, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `PathFind_Roadmap_${profile.name}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    addToast('Roadmap profile exported to JSON', 'success');
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12">
      {/* Profile Header Card */}
      <Card variant="glow" className="p-6 sm:p-8 border-indigo-500/30">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5 pb-6 border-b border-slate-800">
          <div className="flex items-center gap-4">
            <div className="group relative">
              <UserAvatar
                name={profile.name}
                avatarUrl={profile.avatarUrl}
                googlePhotoUrl={firebaseUser?.photoURL}
                size="lg"
                isEditable={true}
                isUploading={isUploadingPhoto}
                onFileSelect={handlePhotoUpload}
              />
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-extrabold text-white">{profile.name}</h1>
                <Badge variant="primary" size="sm">
                  {profile.experienceLevel}
                </Badge>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">{profile.email || firebaseUser?.email}</p>
              <p className="text-xs text-indigo-300 font-medium mt-1 flex items-center gap-1.5">
                <GraduationCap className="w-4 h-4" />
                {profile.education}
              </p>

              {/* Photo Status / Actions */}
              <div className="flex items-center gap-3 mt-1.5">
                {profile.avatarUrl && (
                  <button
                    type="button"
                    onClick={handleRemoveCustomPhoto}
                    className="text-[11px] text-slate-400 hover:text-rose-400 flex items-center gap-1 transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-3 h-3" />
                    <span>Remove custom photo</span>
                  </button>
                )}
                {!profile.avatarUrl && firebaseUser?.photoURL && (
                  <span className="text-[10px] text-indigo-400 font-medium">
                    Google account photo active
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
            {isEditing ? (
              <Button variant="gradient" size="sm" onClick={handleSave} leftIcon={<Save className="w-4 h-4" />}>
                Save Changes
              </Button>
            ) : (
              <Button variant="secondary" size="sm" onClick={() => setIsEditing(true)}>
                Edit Preferences
              </Button>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={handleExportRoadmap}
              leftIcon={<Download className="w-4 h-4" />}
            >
              Export JSON
            </Button>
          </div>
        </div>


        {/* Quick Highlights Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-6 text-xs">
          <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800">
            <span className="text-slate-500 block text-[10px] uppercase font-bold">Target Role</span>
            <span className="font-bold text-white text-sm mt-0.5 block">{profile.careerGoal}</span>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800">
            <span className="text-slate-500 block text-[10px] uppercase font-bold">Weekly Schedule</span>
            <span className="font-bold text-indigo-400 text-sm mt-0.5 block">{profile.weeklyHours}h / week</span>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800">
            <span className="text-slate-500 block text-[10px] uppercase font-bold">Study Streak</span>
            <span className="font-bold text-amber-400 text-sm mt-0.5 flex items-center gap-1">
              <Flame className="w-3.5 h-3.5 fill-amber-400" />
              {profile.streakDays} Days
            </span>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800">
            <span className="text-slate-500 block text-[10px] uppercase font-bold">Preferred Style</span>
            <span className="font-bold text-purple-300 text-xs mt-0.5 block truncate">
              {profile.preferredLearningStyle}
            </span>
          </div>
        </div>
      </Card>

      {/* Editable Preferences or Static View */}
      {isEditing && (
        <Card variant="default" className="p-6 space-y-4">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Sliders className="w-4 h-4 text-indigo-400" />
            Update Learning Preferences
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Education / Degree</label>
              <input
                type="text"
                value={education}
                onChange={(e) => setEducation(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Career Target</label>
              <input
                type="text"
                value={careerGoal}
                onChange={(e) => setCareerGoal(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Weekly Hours ({weeklyHours}h)
              </label>
              <input
                type="range"
                min="2"
                max="20"
                value={weeklyHours}
                onChange={(e) => setWeeklyHours(Number(e.target.value))}
                className="w-full accent-indigo-500 cursor-pointer"
              />
            </div>
          </div>
        </Card>
      )}

      {/* Skills Matrix */}
      <Card variant="default" className="p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-white">Current Skill Inventory</h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Drag proficiency bars to re-calibrate your baseline scores.
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage('assessments')}
          >
            Take Exam
          </Button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
          {(profile.skills || []).map((skill) => (
            <div key={skill.id} className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800">
              <SkillBar
                skill={skill}
                showCategory
                onAdjust={(newVal) => updateSkillProficiency(skill.id, newVal)}
              />
            </div>
          ))}
        </div>
      </Card>

      {/* Completed Courses & Prior Certifications */}
      <Card variant="default" className="p-6 space-y-4">
        <h3 className="text-base font-bold text-white flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          Verified Completed Curriculums
        </h3>

        <div className="space-y-2">
          {(profile.completedCourses || []).map((c, idx) => (
            <div
              key={idx}
              className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between text-xs"
            >
              <div className="flex items-center gap-2.5">
                <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400">
                  <Award className="w-4 h-4" />
                </div>
                <span className="font-semibold text-slate-200">{c}</span>
              </div>
              <Badge variant="success" size="sm">
                Exemption Granted
              </Badge>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};
