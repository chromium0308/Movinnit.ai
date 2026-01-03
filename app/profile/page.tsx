'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import { User } from 'firebase/auth';
import { getUserProfile, updateUserProfile, UserProfile } from '@/lib/user-profile';
import AuthGuard from '@/components/AuthGuard';
import Navbar from '@/components/Navbar';

const ALL_NATIONALITIES = [
  'Irish', 'British', 'American', 'Canadian', 'Australian', 'German', 'French',
  'Spanish', 'Italian', 'Dutch', 'Swedish', 'Norwegian', 'Danish', 'Polish',
  'Indian', 'Chinese', 'Japanese', 'South Korean', 'Brazilian', 'Mexican',
  'South African', 'New Zealander', 'Swiss', 'Austrian', 'Belgian',
  'Portuguese', 'Greek', 'Russian', 'Turkish', 'Egyptian', 'Nigerian',
  'Kenyan', 'Argentine', 'Chilean', 'Colombian', 'Peruvian', 'Venezuelan',
  'Filipino', 'Thai', 'Vietnamese', 'Indonesian', 'Malaysian', 'Singaporean',
  'Israeli', 'Saudi Arabian', 'Emirati', 'Qatari', 'Kuwaiti', 'Lebanese',
  'Jordanian', 'Iraqi', 'Iranian', 'Pakistani', 'Bangladeshi', 'Sri Lankan',
  'Nepalese', 'Afghan', 'Ukrainian', 'Romanian', 'Bulgarian', 'Croatian',
  'Serbian', 'Czech', 'Slovak', 'Hungarian', 'Finnish', 'Estonian',
  'Latvian', 'Lithuanian', 'Icelandic', 'Luxembourgish', 'Maltese', 'Cypriot'
];

function ProfileContent() {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [movingReason, setMovingReason] = useState('');
  const [nationalities, setNationalities] = useState<string[]>([]);
  const [nationalitySearch, setNationalitySearch] = useState('');
  const [nationalitySuggestions, setNationalitySuggestions] = useState<string[]>([]);
  const [showNationalitySuggestions, setShowNationalitySuggestions] = useState(false);
  const [selectedNationalityIndex, setSelectedNationalityIndex] = useState(-1);
  const [isNationalityInputFocused, setIsNationalityInputFocused] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const router = useRouter();

  useEffect(() => {
    getCurrentUser().then(async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        const userProfile = await getUserProfile(currentUser.uid);
        if (userProfile) {
          setProfile(userProfile);
          setFirstName(userProfile.firstName || '');
          setLastName(userProfile.lastName || '');
          setMovingReason(userProfile.movingReason || '');
          setNationalities(userProfile.nationalities || []);
        }
      }
      setLoading(false);
    });
  }, []);

  // Filter nationalities based on search input
  useEffect(() => {
    if (nationalitySearch.trim().length > 0) {
      const searchTerm = nationalitySearch.toLowerCase();
      const filtered = ALL_NATIONALITIES.filter(nat =>
        nat.toLowerCase().includes(searchTerm) && !nationalities.includes(nat)
      );
      setNationalitySuggestions(filtered.slice(0, 8)); // Limit to 8 suggestions
      setShowNationalitySuggestions(filtered.length > 0);
      setSelectedNationalityIndex(-1);
    } else {
      setNationalitySuggestions([]);
      setShowNationalitySuggestions(false);
      setSelectedNationalityIndex(-1);
    }
  }, [nationalitySearch, nationalities]);

  const handleNationalitySearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNationalitySearch(e.target.value);
  };

  const handleNationalityKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (selectedNationalityIndex >= 0 && nationalitySuggestions[selectedNationalityIndex]) {
        // Select the highlighted suggestion
        const selected = nationalitySuggestions[selectedNationalityIndex];
        if (!nationalities.includes(selected)) {
          setNationalities([...nationalities, selected]);
        }
        setNationalitySearch('');
        setShowNationalitySuggestions(false);
      } else if (nationalitySuggestions.length > 0) {
        // Select the first suggestion if none is highlighted
        const firstSuggestion = nationalitySuggestions[0];
        if (!nationalities.includes(firstSuggestion)) {
          setNationalities([...nationalities, firstSuggestion]);
        }
        setNationalitySearch('');
        setShowNationalitySuggestions(false);
      } else if (nationalitySearch.trim() && !nationalities.includes(nationalitySearch.trim())) {
        // Use the typed value as-is
        setNationalities([...nationalities, nationalitySearch.trim()]);
        setNationalitySearch('');
        setShowNationalitySuggestions(false);
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedNationalityIndex(prev =>
        prev < nationalitySuggestions.length - 1 ? prev + 1 : prev
      );
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedNationalityIndex(prev => prev > 0 ? prev - 1 : -1);
    } else if (e.key === 'Escape') {
      setShowNationalitySuggestions(false);
      setSelectedNationalityIndex(-1);
    }
  };

  const handleNationalitySuggestionClick = (nationality: string) => {
    if (!nationalities.includes(nationality)) {
      setNationalities([...nationalities, nationality]);
    }
    setNationalitySearch('');
    setShowNationalitySuggestions(false);
    setSelectedNationalityIndex(-1);
  };

  const handleRemoveNationality = (nationality: string) => {
    setNationalities(nationalities.filter(n => n !== nationality));
  };

  const handleSave = async () => {
    if (!user) return;

    if (nationalities.length === 0) {
      setError('Please select at least one nationality');
      return;
    }

    setSaving(true);
    setError('');
    setSuccess('');

    try {
      await updateUserProfile(user.uid, {
        firstName,
        lastName,
        nationalities,
        movingReason,
      });
      setSuccess('Profile updated successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update profile';
      setError(errorMessage);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-lg text-white">Loading profile...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Navbar />

      <main className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8 pt-24">
        <div className="space-y-8">
          <div>
            <h2 className="text-3xl font-bold text-white">Profile</h2>
            <p className="mt-2 text-gray-300">Manage your personal information and nationality</p>
          </div>

          {error && (
            <div className="rounded-md bg-red-500/20 border border-red-500/50 p-4 text-sm text-red-200">
              {error}
            </div>
          )}

          {success && (
            <div className="rounded-md bg-green-500/20 border border-green-500/50 p-4 text-sm text-green-200">
              {success}
            </div>
          )}

          <div className="rounded-lg bg-black/20 backdrop-blur-md border border-white/20 p-6 space-y-6">
            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Email
              </label>
              <input
                type="email"
                value={user?.email || ''}
                disabled
                className="w-full rounded-md border border-white/10 bg-white/5 px-3 py-2 text-white/50 cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-white mb-2">
                First Name
              </label>
              <input
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="w-full rounded-md border border-white/10 bg-white/5 px-3 py-2 text-white placeholder:text-white/50 focus:border-white/30 focus:outline-none"
                placeholder="Enter your first name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Last Name
              </label>
              <input
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="w-full rounded-md border border-white/10 bg-white/5 px-3 py-2 text-white placeholder:text-white/50 focus:border-white/30 focus:outline-none"
                placeholder="Enter your last name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Reason for Moving
              </label>
              <p className="text-sm text-gray-400 mb-2">
                Providing a reason (e.g., Work, Study, Family) helps us tailor your paperwork guide.
              </p>
              <textarea
                value={movingReason}
                onChange={(e) => setMovingReason(e.target.value)}
                className="w-full rounded-md border border-white/10 bg-white/5 px-3 py-2 text-white placeholder:text-white/50 focus:border-white/30 focus:outline-none min-h-[80px]"
                placeholder="Why are you planning to move?"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Your Nationality/Nationalities
              </label>
              <p className="text-sm text-gray-300 mb-4">
                Search and select one or more nationalities
              </p>

              {/* Selected Nationalities */}
              {nationalities.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-4">
                  {nationalities.map((nationality) => (
                    <span
                      key={nationality}
                      className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-sm font-medium text-white"
                    >
                      {nationality}
                      <button
                        onClick={() => handleRemoveNationality(nationality)}
                        className="text-white/70 hover:text-white"
                        disabled={saving}
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              )}

              {/* Nationality Search */}
              <div className="relative">
                <div
                  className={`relative overflow-hidden border transition-all duration-300 ease-in-out ${isNationalityInputFocused
                    ? 'border-white shadow-lg shadow-white/20 bg-white/10'
                    : 'border-white/10 hover:border-white/50 bg-white/5'
                    }`}
                  onMouseEnter={() => setIsNationalityInputFocused(true)}
                  onMouseLeave={() => setIsNationalityInputFocused(false)}
                >
                  <input
                    type="text"
                    value={nationalitySearch}
                    onChange={handleNationalitySearchChange}
                    onKeyDown={handleNationalityKeyDown}
                    onFocus={() => {
                      setIsNationalityInputFocused(true);
                      if (nationalitySuggestions.length > 0) {
                        setShowNationalitySuggestions(true);
                      }
                    }}
                    onBlur={() => {
                      setIsNationalityInputFocused(false);
                      setTimeout(() => {
                        setShowNationalitySuggestions(false);
                      }, 200);
                    }}
                    placeholder="Search for a nationality (e.g., 'Irish', 'American')"
                    className="block w-full bg-transparent px-3 py-2 text-white placeholder:text-white/50 focus:outline-none relative z-0"
                    disabled={saving}
                  />
                </div>

                {/* Suggestions Dropdown */}
                {showNationalitySuggestions && nationalitySuggestions.length > 0 && (
                  <div className="absolute z-50 w-full mt-2 bg-black/95 backdrop-blur-sm border border-white/20 rounded-lg shadow-lg max-h-64 overflow-y-auto">
                    {nationalitySuggestions.map((suggestion, index) => {
                      const isHighlighted = index === selectedNationalityIndex;

                      return (
                        <button
                          key={suggestion}
                          type="button"
                          onClick={() => handleNationalitySuggestionClick(suggestion)}
                          className={`w-full text-left px-4 py-3 flex items-center justify-between hover:bg-white/10 transition-colors ${isHighlighted ? 'bg-white/10' : ''
                            }`}
                          onMouseEnter={() => setSelectedNationalityIndex(index)}
                        >
                          <span className="text-white text-sm">{suggestion}</span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            <div className="pt-4">
              <button
                onClick={handleSave}
                disabled={saving || nationalities.length === 0}
                className="w-full rounded-full bg-white text-black px-6 py-3 text-lg font-medium hover:bg-white/90 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {saving ? 'Saving...' : 'Save Profile'}
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default function ProfilePage() {
  return (
    <AuthGuard>
      <ProfileContent />
    </AuthGuard>
  );
}

