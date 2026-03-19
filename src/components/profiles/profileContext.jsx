import React from 'react';
import profiles from './profiles.json';
import { fetchProfilesData, readProfilesLocal, updateProfileData } from './dataStore.js';

const ProfileContext = React.createContext(null);

const DEFAULT_PROFILE_ID = 'default';
const JOHN_PROFILE_ID = 'john';

export function ProfileProvider({ children }) {
  const [activeProfileId, setActiveProfileId] = React.useState(DEFAULT_PROFILE_ID);
  const [profileMap, setProfileMap] = React.useState(readProfilesLocal() || profiles || {});

  const resetToDefaultProfile = React.useCallback(() => {
    setActiveProfileId(DEFAULT_PROFILE_ID);
  }, []);

  const refreshProfiles = React.useCallback(async () => {
    const result = await fetchProfilesData();
    if (result?.profiles) {
      setProfileMap(result.profiles);
      return result.profiles;
    }
    return null;
  }, []);

  React.useEffect(() => {
    refreshProfiles();
  }, [refreshProfiles]);

  const activeProfile = profileMap[activeProfileId] || profileMap[DEFAULT_PROFILE_ID];

  const updateActiveProfile = React.useCallback(async ({ updates, currentPassword }) => {
    const result = await updateProfileData(activeProfileId, { updates, currentPassword });

    if (!result?.ok) {
      return {
        ok: false,
        error: result?.error || 'Failed to update profile.'
      };
    }

    if (result?.profiles) {
      setProfileMap(result.profiles);
    }

    return { ok: true };
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
