import React from 'react';
import profiles from './profiles.json';

const ProfileContext = React.createContext(null);

const DEFAULT_PROFILE_ID = 'default';
const JOHN_PROFILE_ID = 'john';

export function ProfileProvider({ children }) {
  const [activeProfileId, setActiveProfileId] = React.useState(DEFAULT_PROFILE_ID);
  const [profileMap, setProfileMap] = React.useState(profiles || {});

  const resetToDefaultProfile = React.useCallback(() => {
    setActiveProfileId(DEFAULT_PROFILE_ID);
  }, []);

  const refreshProfiles = React.useCallback(async () => {
    try {
      const response = await fetch('/api/profiles');
      if (!response.ok) {
        return null;
      }
      const payload = await response.json();
      if (payload?.profiles) {
        setProfileMap(payload.profiles);
        return payload.profiles;
      }
      return null;
    } catch (error) {
      return null;
    }
  }, []);

  React.useEffect(() => {
    refreshProfiles();
  }, [refreshProfiles]);

  const activeProfile = profileMap[activeProfileId] || profileMap[DEFAULT_PROFILE_ID];

  const updateActiveProfile = React.useCallback(async ({ updates, currentPassword }) => {
    try {
      const response = await fetch(`/api/profiles/${activeProfileId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ updates, currentPassword })
      });

      const payload = await response.json();

      if (!response.ok) {
        return {
          ok: false,
          error: payload?.error || 'Failed to update profile.'
        };
      }

      if (payload?.profiles) {
        setProfileMap(payload.profiles);
      }

      return { ok: true };
    } catch (error) {
      return {
        ok: false,
        error: 'Could not reach the profile API.'
      };
    }
  }, [activeProfileId]);

  const value = React.useMemo(
    () => ({
      profiles: profileMap,
      activeProfile,
      activeProfileId,
      setActiveProfileId,
      resetToDefaultProfile,
      refreshProfiles,
      updateActiveProfile,
      defaultProfileId: DEFAULT_PROFILE_ID,
      johnProfileId: JOHN_PROFILE_ID
    }),
    [profileMap, activeProfile, activeProfileId, resetToDefaultProfile, refreshProfiles, updateActiveProfile]
  );

  return <ProfileContext.Provider value={value}>{children}</ProfileContext.Provider>;
}

export function useProfile() {
  const context = React.useContext(ProfileContext);
  if (!context) {
    throw new Error('useProfile must be used within a ProfileProvider.');
  }
  return context;
}
