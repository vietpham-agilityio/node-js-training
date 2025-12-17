import { useMemo } from 'react';
import { ActivityIndicator, Alert, ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// Unwind
import { withUniwind } from 'uniwind';

// Constants
import { ROUTES, SETTING_ITEMS } from '@/constants';

// Hooks
import { useProfile } from '@/hooks';

// Components
import { Avatar, Typo } from '@/components/common';
import { SettingItem } from '@/components/feature';
import { UserProfileIcon } from '@/icons';
import { router } from 'expo-router';

const StyledSafeAreaView = withUniwind(SafeAreaView);
const StyledScrollView = withUniwind(ScrollView);

enum SettingKey {
  Edit = 'edit',
  MyWallet = 'my_wallet',
  ChangeLanguage = 'change_language',
  HelpCenter = 'help_center',
  RateApp = 'rate_app',
}

const ProfileScreen = () => {
  const { data: profile, isLoading: isProfileLoading } = useProfile();

  const SETTING_ACTIONS: Record<SettingKey, () => void> = useMemo(
    () => ({
      [SettingKey.Edit]: () => router.navigate(ROUTES.PROFILE_EDIT),
      [SettingKey.MyWallet]: () => null,
      [SettingKey.ChangeLanguage]: () => null,
      [SettingKey.HelpCenter]: () => null,
      [SettingKey.RateApp]: () => {
        Alert.alert('Enjoying Movea?', 'Please take a moment to rate us ⭐', [
          { text: 'Later', style: 'cancel' },
          {
            text: 'Rate now',
            onPress: () => null,
          },
        ]);
      },
    }),
    [],
  );

  if (isProfileLoading) {
    return (
      <StyledSafeAreaView
        edges={['bottom']}
        className="flex-1 bg-bg-primary items-center justify-center"
        accessibilityLabel="Loading Profile"
      >
        <ActivityIndicator size="large" />
        <Typo className="text-text-secondary mt-4">Loading profile...</Typo>
      </StyledSafeAreaView>
    );
  }

  return (
    <StyledSafeAreaView
      edges={['bottom']}
      className="flex-1 bg-bg-primary"
      accessibilityLabel="Profile screen"
      accessibilityHint="Profile screen"
    >
      <StyledScrollView
        contentContainerClassName="flex-1 px-6"
        showsVerticalScrollIndicator={false}
      >
        <View className="justify-center items-center gap-6">
          <Avatar
            size={132}
            variant="default"
            source={profile?.avatarUrl}
            defaultAvatar={UserProfileIcon}
            accessibilityLabel="Profile avatar"
          />

          <View className="gap-1 items-center">
            <Typo size="lg" weight="medium">
              {profile?.fullName}
            </Typo>
            <Typo size="base" weight="regular" className="text-overlay-soft">
              {profile?.email}
            </Typo>
          </View>
        </View>

        <View className="mt-8 gap-5">
          {SETTING_ITEMS.map(item => (
            <SettingItem
              key={item.TEST_ID}
              title={item.TITLE}
              icon={item.ICON}
              testID={item.TEST_ID}
              onPress={SETTING_ACTIONS[item.TEST_ID as SettingKey]}
            />
          ))}
        </View>
      </StyledScrollView>
    </StyledSafeAreaView>
  );
};

export default ProfileScreen;
