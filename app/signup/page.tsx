'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { signUp } from '@/lib/auth';
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

export default function SignUpPage() {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [nationalities, setNationalities] = useState<string[]>([]);
  const [nationalitySearch, setNationalitySearch] = useState('');
  const [nationalitySuggestions, setNationalitySuggestions] = useState<string[]>([]);
  const [showNationalitySuggestions, setShowNationalitySuggestions] = useState(false);
  const [selectedNationalityIndex, setSelectedNationalityIndex] = useState(-1);
  const [isNationalityInputFocused, setIsNationalityInputFocused] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

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

  const handleGoogleSignIn = async () => {
    setError('');
    setLoading(true);
    setError('Google sign-in not yet implemented.');
    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    if (nationalities.length === 0) {
      setError('Please select at least one nationality');
      return;
    }

    setLoading(true);

    try {
      await signUp(email, password, firstName, lastName, nationalities);
      router.push('/dashboard');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create account';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex w-full flex-col min-h-screen relative">
      <Navbar />

      {/* Content */}
      <div className="relative z-10 flex flex-1 flex-col justify-center items-center mt-[150px] pb-20">
        <div className="w-full max-w-md px-4">
          <div className="space-y-6 text-center">
            <div className="space-y-1">
              <h1 className="text-[2.5rem] font-bold leading-[1.1] tracking-tight text-white">Welcome to Movin&apos; it</h1>
              <p className="text-[1.8rem] text-white/70 font-light">Your migration paperwork assistant</p>
            </div>

            {error && (
              <div className="rounded-md bg-red-500/20 border border-red-500/50 p-4 text-sm text-red-200">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="relative">
                <input
                  type="text"
                  placeholder="First Name"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="w-full backdrop-blur-[1px] text-white border-1 border-white/10 rounded-full py-3 px-4 focus:outline-none focus:border focus:border-white/30 text-center bg-white/5 placeholder:text-white/50"
                  required
                  disabled={loading}
                />
              </div>

              <div className="relative">
                <input
                  type="text"
                  placeholder="Last Name"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="w-full backdrop-blur-[1px] text-white border-1 border-white/10 rounded-full py-3 px-4 focus:outline-none focus:border focus:border-white/30 text-center bg-white/5 placeholder:text-white/50"
                  required
                  disabled={loading}
                />
              </div>

              <div className="relative">
                <input
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full backdrop-blur-[1px] text-white border-1 border-white/10 rounded-full py-3 px-4 focus:outline-none focus:border focus:border-white/30 text-center bg-white/5 placeholder:text-white/50"
                  required
                  disabled={loading}
                />
              </div>

              <div className="relative">
                <input
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full backdrop-blur-[1px] text-white border-1 border-white/10 rounded-full py-3 px-4 focus:outline-none focus:border focus:border-white/30 text-center bg-white/5 placeholder:text-white/50"
                  required
                  disabled={loading}
                />
              </div>

              <div className="relative">
                <input
                  type="password"
                  placeholder="Confirm Password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full backdrop-blur-[1px] text-white border-1 border-white/10 rounded-full py-3 px-4 focus:outline-none focus:border focus:border-white/30 text-center bg-white/5 placeholder:text-white/50"
                  required
                  disabled={loading}
                />
              </div>

              {/* Nationality Selection */}
              <div className="space-y-3">
                <label className="block text-sm font-medium text-white text-left">
                  Your Nationality/Nationalities
                </label>
                <p className="text-xs text-gray-300 text-left">
                  Search and select one or more nationalities
                </p>

                {/* Selected Nationalities */}
                {nationalities.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {nationalities.map((nationality) => (
                      <span
                        key={nationality}
                        className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-sm font-medium text-white"
                      >
                        {nationality}
                        <button
                          type="button"
                          onClick={() => handleRemoveNationality(nationality)}
                          className="text-white/70 hover:text-white"
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

              <button
                type="submit"
                disabled={loading || !email || !password || !confirmPassword || !firstName || !lastName || nationalities.length === 0}
                className="w-full rounded-full bg-white text-black font-medium py-3 hover:bg-white/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Creating account...' : 'Sign Up'}
              </button>
            </form>

            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="h-px bg-white/10 flex-1" />
                <span className="text-white/40 text-sm">or</span>
                <div className="h-px bg-white/10 flex-1" />
              </div>

              <button
                onClick={handleGoogleSignIn}
                disabled={loading}
                className="backdrop-blur-[2px] w-full flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 text-white border border-white/10 rounded-full py-3 px-4 transition-colors disabled:opacity-50"
              >
                <span className="text-lg">G</span>
                <span>Sign in with Google</span>
              </button>
            </div>

            <p className="text-xs text-white/40 pt-10">
              Already have an account?{' '}
              <Link href="/login" className="underline text-white/40 hover:text-white/60 transition-colors">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
