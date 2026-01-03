'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import { User } from 'firebase/auth';
import { getUserProfile } from '@/lib/user-profile';
import { createGuide } from '@/lib/database';
import AuthGuard from '@/components/AuthGuard';
import Navbar from '@/components/Navbar';
import LiquidLoading from '@/components/ui/liquid-loader';
import Link from 'next/link';

// Helper function to get country code for flag emoji
const getCountryCode = (destination: string): string => {
  const countryMap: { [key: string]: string } = {
    'USA': 'us',
    'UK': 'gb',
    'Canada': 'ca',
    'Australia': 'au',
    'Germany': 'de',
    'France': 'fr',
    'Netherlands': 'nl',
    'Ireland': 'ie',
    'Singapore': 'sg',
    'Japan': 'jp',
    'Spain': 'es',
    'Switzerland': 'ch',
    'Sweden': 'se',
    'Denmark': 'dk',
    'Norway': 'no',
  };

  const parts = destination.split(', ');
  const country = parts.length > 1 ? parts[1] : destination;
  return countryMap[country] || 'us';
};

// Helper function to get city image URL
const getCityImageUrl = (city: string): string => {
  const cityName = city.split(',')[0].trim();

  // Map city names to reliable image sources
  // Using Picsum Photos with specific seeds for consistent city images
  const cityImageMap: { [key: string]: string } = {
    'New York': 'https://res.cloudinary.com/dtljonz0f/image/upload/c_auto,ar_4:3,w_3840,g_auto/f_auto/q_auto/v1/gc-v1/new-york-pass/-%20banner%20options%20shutterstock_1011270001?_a=BAVAZGGf0',
    'London': 'https://res.cloudinary.com/dtljonz0f/image/upload/london-skyline-night-shutterstock_2148132111_qeyikq',
    'Toronto': 'https://travel2next.com/wp-content/uploads/toronto-at-night-2.jpg',
    'Sydney': 'https://www.kkday.com/en-sg/blog/wp-content/uploads/Australia_Sydney_AFotolia_155673241.jpg',
    'Berlin': 'https://images.squarespace-cdn.com/content/v1/569e766e69492e9dd5373ef6/1636375128403-RLYKKX77GGWOZZ22UL3U/_ABZ3653-alex.jpg',
    'Paris': 'https://media.tacdn.com/media/attractions-splice-spp-674x446/06/d0/bf/c2.jpg',
    'Amsterdam': 'https://www.clinkhostels.com/wp-content/uploads/2023/07/Night-Lights-Amsterdam-Nightlife.jpg',
    'Dublin': 'https://travel2next.com/wp-content/uploads/dublin-skyline-at-night.jpg',
    'Melbourne': 'https://api.nomadsworld.com/wp-content/uploads/2020/06/melbourne-night-unsplash-min.jpg',
    'Vancouver': 'https://i0.wp.com/sipmagazine.com/wp-content/uploads/2024/11/Vancouver-BC-Night-Out.jpg?fit=1920%2C1080&ssl=1',
    'San Francisco': 'https://images.unsplash.com/photo-1575649212536-13a4528f44d2?fm=jpg&q=60&w=3000&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8c2FuJTIwZnJhbmNpc2NvJTIwYXQlMjBuaWdodHxlbnwwfHwwfHx8MA%3D%3D',
    'Los Angeles': 'https://images.contentstack.io/v3/assets/blt06f605a34f1194ff/blt951de5e9efff6777/64f958b8a8cf8b192d3de621/0_-_BCC-2023-THINGS-TO-DO-IN-LA-AT-NIGHT-0.webp?format=webp&quality=60&width=1440',
    'Singapore': 'https://oceanjar-new.s3.ap-south-1.amazonaws.com/Things_to_Do_in_Singapore_at_Night_0747b47186.png',
    'Tokyo': 'https://www.travelanddestinations.com/wp-content/uploads/2019/01/Tokyo-Japan-night.jpg',
    'Barcelona': 'https://images.squarespace-cdn.com/content/v1/569e766e69492e9dd5373ef6/1535988645532-TRCRBG8WW13OOEZFG1CQ/Barcelona-+Alexander-014-aperture-tours.jpg',
    'Chicago': 'https://travelswithelle.com/wp-content/uploads/2021/11/Best-Things-To-Do-In-Chicago-At-Night-TravelsWithElle.jpg',
    'Boston': 'https://roamingboston.com/wp-content/uploads/2022/07/Fan-Pier-Park-Seaport.jpg',
    'Seattle': 'https://d36tnp772eyphs.cloudfront.net/blogs/1/2016/10/Seattle-at-night-skyline.jpg',
    'Zurich': 'https://i.ytimg.com/vi/uiuuO57B9SM/maxresdefault.jpg',
    'Stockholm': 'https://res.cloudinary.com/hello-tickets/image/upload/c_limit,f_auto,q_auto,w_768/v1710116143/post_images/Estocolmo-148/night/16017043753_e522a66af6_o_Cropped.jpg',
    'Copenhagen': 'https://www.celebritycruises.com/blog/content/uploads/2024/11/things-to-do-in-copenhagen-at-night-tivoli-gardens-1024x683.jpg',
    'Oslo': 'https://media.istockphoto.com/id/1418101061/photo/oslo-in-norway.jpg?s=612x612&w=0&k=20&c=q3alt2q_k5QFJjh_5eocig4qjxcOAExwsk5RRfH_VJE=',
  };

  // Return mapped image or fallback to a generic cityscape
  return cityImageMap[cityName] || `https://images.unsplash.com/photo-1496442227936-7fbd341dc1ed?w=800&h=600&fit=crop&q=80`;
};

// Helper function to get flag emoji from country code
const getFlagEmoji = (countryCode: string): string => {
  const codePoints = countryCode
    .toUpperCase()
    .split('')
    .map(char => 127397 + char.charCodeAt(0));
  return String.fromCodePoint(...codePoints);
};

const POPULAR_DESTINATIONS = [
  'New York, USA',
  'London, UK',
  'Toronto, Canada',
  'Sydney, Australia',
  'Berlin, Germany',
  'Paris, France',
  'Amsterdam, Netherlands',
  'Dublin, Ireland',
  'Melbourne, Australia',
  'Vancouver, Canada',
  'San Francisco, USA',
  'Los Angeles, USA',
  'Singapore',
  'Tokyo, Japan',
  'Barcelona, Spain',
];

const OTHER_DESTINATIONS = [
  'Chicago, USA', 'Boston, USA', 'Seattle, USA',
  'Zurich, Switzerland', 'Stockholm, Sweden',
  'Copenhagen, Denmark', 'Oslo, Norway'
];

// Combine all destinations for search
const ALL_DESTINATIONS = [...POPULAR_DESTINATIONS, ...OTHER_DESTINATIONS];

function DashboardContent() {
  const [user, setUser] = useState<User | null>(null);
  const [nationalities, setNationalities] = useState<string[]>([]);
  const [movingReason, setMovingReason] = useState<string>('');
  const [destination, setDestination] = useState('');
  const [customDestination, setCustomDestination] = useState('');
  const [searchSuggestions, setSearchSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState(-1);
  const [hoveredDestination, setHoveredDestination] = useState<string | null>(null);
  const [isCustomInputFocused, setIsCustomInputFocused] = useState(false);
  const [loading, setLoading] = useState(true);
  const [guideLoading, setGuideLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  useEffect(() => {
    getCurrentUser().then(async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        const profile = await getUserProfile(currentUser.uid);
        if (profile) {
          setNationalities(profile.nationalities || []);
          setMovingReason(profile.movingReason || '');
        }
      }
      setLoading(false);
    });
  }, []);

  // Filter destinations based on search input
  useEffect(() => {
    if (customDestination.trim().length > 0) {
      const searchTerm = customDestination.toLowerCase();
      const filtered = ALL_DESTINATIONS.filter(dest =>
        dest.toLowerCase().includes(searchTerm)
      );
      setSearchSuggestions(filtered.slice(0, 8)); // Limit to 8 suggestions
      setShowSuggestions(filtered.length > 0);
      setSelectedSuggestionIndex(-1);
    } else {
      setSearchSuggestions([]);
      setShowSuggestions(false);
      setSelectedSuggestionIndex(-1);
    }
  }, [customDestination]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCustomDestination(e.target.value);
  };

  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      if (selectedSuggestionIndex >= 0 && searchSuggestions[selectedSuggestionIndex]) {
        // Select the highlighted suggestion
        const selected = searchSuggestions[selectedSuggestionIndex];
        setDestination(selected);
        setCustomDestination(selected);
        setShowSuggestions(false);
      } else if (searchSuggestions.length > 0) {
        // Select the first suggestion if none is highlighted
        const firstSuggestion = searchSuggestions[0];
        setDestination(firstSuggestion);
        setCustomDestination(firstSuggestion);
        setShowSuggestions(false);
      } else if (customDestination.trim()) {
        // Use the typed value as-is
        setDestination(customDestination.trim());
        setShowSuggestions(false);
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedSuggestionIndex(prev =>
        prev < searchSuggestions.length - 1 ? prev + 1 : prev
      );
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedSuggestionIndex(prev => prev > 0 ? prev - 1 : -1);
    } else if (e.key === 'Escape') {
      setShowSuggestions(false);
      setSelectedSuggestionIndex(-1);
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setDestination(suggestion);
    setCustomDestination(suggestion);
    setShowSuggestions(false);
    setSelectedSuggestionIndex(-1);
  };

  const handleStartGuide = async (destinationOverride?: string) => {
    const targetDestination = destinationOverride || destination;

    if (nationalities.length === 0) {
      setError('Please set your nationality in your profile first');
      return;
    }
    if (!targetDestination) {
      setError('Please select a destination');
      return;
    }

    setGuideLoading(true);
    setError('');

    try {
      if (!user) {
        throw new Error('User not authenticated');
      }

      const response = await fetch('/api/generate-guide', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${await user.getIdToken()}`,
        },
        body: JSON.stringify({
          nationalities,
          destination: targetDestination,
          movingReason,
          uid: user.uid
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate guide');
      }

      const data = await response.json();

      // Write guide to database using authenticated client SDK
      const guideId = await createGuide(
        data.uid,
        data.nationalities,
        data.destination,
        data.summary,
        data.steps
      );

      router.push(`/guide/${guideId}`);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to generate guide';
      setError(errorMessage);
    } finally {
      setGuideLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-lg text-white">Loading...</div>
      </div>
    );
  }

  // Show loading screen when guide is being generated
  if (guideLoading) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <div className="flex min-h-[calc(100vh-80px)] items-center justify-center">
          <div className="flex flex-col items-center space-y-8">
            <LiquidLoading />
            <p className="text-base md:text-lg font-medium text-white animate-fade-in-out">
              Generating your perfect moving guide
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Navbar />

      <main className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8 pt-24">
        <div className="space-y-8">
          <div>
            <h2 className="text-3xl font-bold text-white">Migration Dashboard</h2>
            <p className="mt-2 text-gray-300">Generate a paperwork guide for your destination</p>
          </div>

          {error && (
            <div className="rounded-md bg-red-500/20 border border-red-500/50 p-4 text-sm text-red-200">
              {error}
            </div>
          )}

          {nationalities.length === 0 && (
            <div className="rounded-lg bg-yellow-500/20 border border-yellow-500/50 p-4 text-sm text-yellow-200">
              <p className="mb-2">
                No nationality set. Please set your nationality in your profile to generate a guide.
              </p>
              <Link
                href="/profile"
                className="inline-block rounded-full bg-white text-black px-4 py-2 text-sm font-medium hover:bg-white/90 transition-colors"
              >
                Go to Profile
              </Link>
            </div>
          )}

          <div className="rounded-lg bg-black/20 backdrop-blur-md border border-white/20 p-6">
            <label className="block text-sm font-medium text-white mb-4">
              Destination
            </label>
            <p className="mb-4 text-sm text-gray-300">
              Where would you like to move?
            </p>

            {/* Popular Destinations Cards */}
            <div className="mb-4">
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-4">
                {POPULAR_DESTINATIONS.map((dest) => {
                  const cityName = dest.split(',')[0];
                  const countryCode = getCountryCode(dest);
                  const isSelected = destination === dest;

                  return (
                    <button
                      key={dest}
                      onClick={() => setDestination(dest)}
                      onDoubleClick={() => handleStartGuide(dest)}
                      onMouseEnter={() => setHoveredDestination(dest)}
                      onMouseLeave={() => setHoveredDestination(null)}
                      className={`relative overflow-hidden rounded-xl aspect-[4/3] group transition-all duration-300 ${hoveredDestination === dest
                        ? 'ring-2 ring-white shadow-lg shadow-white/20 scale-105'
                        : isSelected
                          ? 'ring-2 ring-white scale-105'
                          : 'hover:scale-105'
                        }`}
                    >
                      <div className="absolute inset-0">
                        <img
                          src={getCityImageUrl(dest)}
                          alt={cityName}
                          className="w-full h-full object-cover"
                          loading="lazy"
                          onError={(e) => {
                            // Fallback to a generic cityscape image if the specific one fails
                            (e.target as HTMLImageElement).src = `https://images.unsplash.com/photo-1496442227936-7fbd341dc1ed?w=800&h=600&fit=crop&q=80`;
                          }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                      </div>

                      <div className="absolute top-3 left-3 flex items-center gap-2 z-10">
                        <span className="text-white font-semibold text-sm md:text-base">{cityName}</span>
                        <span className="text-2xl" role="img" aria-label={`${countryCode} flag`}>
                          {getFlagEmoji(countryCode)}
                        </span>
                      </div>
                      {isSelected && (
                        <div className="absolute inset-0 bg-white/10 border-2 border-white rounded-xl" />
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Other Destinations */}
              <details className="mt-4">
                <summary className="cursor-pointer text-sm text-gray-400 hover:text-white mb-4">
                  More destinations
                </summary>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-2">
                  {OTHER_DESTINATIONS.map((dest) => {
                    const cityName = dest.split(',')[0];
                    const countryCode = getCountryCode(dest);
                    const isSelected = destination === dest;

                    return (
                      <button
                        key={dest}
                        onClick={() => setDestination(dest)}
                        onDoubleClick={() => handleStartGuide(dest)}
                        onMouseEnter={() => setHoveredDestination(dest)}
                        onMouseLeave={() => setHoveredDestination(null)}
                        className={`relative overflow-hidden rounded-xl aspect-[4/3] group transition-all duration-300 ${hoveredDestination === dest
                          ? 'ring-2 ring-white shadow-lg shadow-white/20 scale-105'
                          : isSelected
                            ? 'ring-2 ring-white scale-105'
                            : 'hover:scale-105'
                          }`}
                      >
                        <div className="absolute inset-0">
                          <img
                            src={getCityImageUrl(dest)}
                            alt={cityName}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = `https://images.unsplash.com/photo-1496442227936-7fbd341dc1ed?w=800&q=80`;
                            }}
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                        </div>

                        <div className="absolute top-3 left-3 flex items-center gap-2 z-10">
                          <span className="text-white font-semibold text-sm md:text-base">{cityName}</span>
                          <span className="text-2xl" role="img" aria-label={`${countryCode} flag`}>
                            {getFlagEmoji(countryCode)}
                          </span>
                        </div>
                        {isSelected && (
                          <div className="absolute inset-0 bg-white/10 border-2 border-white rounded-xl" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </details>
            </div>

            {/* Custom Destination Search */}
            <div className="mt-4 pt-4 border-t border-white/10 relative">
              <div
                className={`relative overflow-hidden border transition-all duration-300 ease-in-out ${isCustomInputFocused
                  ? 'border-white shadow-lg shadow-white/20 bg-white/10'
                  : 'border-white/10 hover:border-white/50 bg-white/5'
                  }`}
                onMouseEnter={() => setIsCustomInputFocused(true)}
                onMouseLeave={() => setIsCustomInputFocused(false)}
              >
                <input
                  type="text"
                  value={customDestination}
                  onChange={handleSearchChange}
                  onKeyDown={handleSearchKeyDown}
                  onFocus={() => {
                    setIsCustomInputFocused(true);
                    if (searchSuggestions.length > 0) {
                      setShowSuggestions(true);
                    }
                  }}
                  onBlur={() => {
                    setIsCustomInputFocused(false);
                    // Delay hiding suggestions to allow clicks
                    setTimeout(() => {
                      setShowSuggestions(false);
                    }, 200);
                  }}
                  placeholder="Search for a destination (e.g., 'Tokyo, Japan')"
                  className="block w-full bg-transparent px-3 py-2 text-white placeholder:text-white/50 focus:outline-none relative z-0"
                />
              </div>

              {/* Suggestions Dropdown */}
              {showSuggestions && searchSuggestions.length > 0 && (
                <div className="absolute z-50 w-full mt-2 bg-black/95 backdrop-blur-sm border border-white/20 rounded-lg shadow-lg max-h-64 overflow-y-auto">
                  {searchSuggestions.map((suggestion, index) => {
                    const cityName = suggestion.split(',')[0];
                    const countryCode = getCountryCode(suggestion);
                    const isHighlighted = index === selectedSuggestionIndex;

                    return (
                      <button
                        key={suggestion}
                        type="button"
                        onClick={() => handleSuggestionClick(suggestion)}
                        className={`w-full text-left px-4 py-3 flex items-center justify-between hover:bg-white/10 transition-colors ${isHighlighted ? 'bg-white/10' : ''
                          }`}
                        onMouseEnter={() => setSelectedSuggestionIndex(index)}
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-2xl" role="img" aria-label={`${countryCode} flag`}>
                            {getFlagEmoji(countryCode)}
                          </span>
                          <div className="flex flex-col">
                            <span className="text-white font-medium text-sm">{cityName}</span>
                            <span className="text-gray-400 text-xs">{suggestion}</span>
                          </div>
                        </div>
                        {destination === suggestion && (
                          <span className="text-white text-xs">✓</span>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {destination && (
              <div className="mt-4 p-3 rounded-lg bg-white/10 border border-white/20">
                <p className="text-sm text-white">
                  <span className="font-semibold">Selected:</span> {destination}
                </p>
              </div>
            )}
          </div>

          <div>
            <button
              onClick={() => handleStartGuide()}
              disabled={guideLoading || nationalities.length === 0 || !destination}
              className="w-full rounded-full bg-white text-black px-6 py-3 text-lg font-medium hover:bg-white/90 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {guideLoading ? 'Generating your migration guide...' : 'Start Migration Guide'}
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <AuthGuard>
      <DashboardContent />
    </AuthGuard>
  );
}

