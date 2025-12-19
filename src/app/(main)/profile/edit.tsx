import { ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { withUniwind } from 'uniwind';

// Constants
import { ERROR_MESSAGES, MESSAGES, ToastType } from '@/constants';

// Hooks
import {
  useProfile,
  useUpdateProfile,
  useUploadAvatar,
} from '@/features/setting/hooks/useProfile';
import { useToastAlert } from '@/hooks/useToast';

// Types
import { UpdateProfileData } from '@/features/auth/types/auth';

// Components
import { EditProfileForm } from '@/features/setting/components/EditProfileForm';

const StyledSafeAreaView = withUniwind(SafeAreaView);
const StyledScrollView = withUniwind(ScrollView);

const EditProfileScreen = () => {
  const toast = useToastAlert();
  const { data: profile, isLoading: isProfileLoading } = useProfile();
  const { mutate: updateProfile, isPending: isUpdating } = useUpdateProfile();
  const { mutate: uploadAvatar, isPending: isUploading } = useUploadAvatar();

  const isLoading = isProfileLoading || isUpdating || isUploading;

  const handleSubmit = async (data: UpdateProfileData) => {
    try {
      let avatarUploadUrl: string | undefined = undefined;

      // Only update avatar if it has changed
      if (data.avatarUrl && data.avatarUrl !== profile?.avatarUrl) {
        await new Promise<void>((resolve, reject) => {
          uploadAvatar(
            { uri: data.avatarUrl! },
            {
              onSuccess: uploadedUrl => {
                avatarUploadUrl = uploadedUrl as string;
                resolve();
              },
              onError: error => reject(error),
            },
          );
        });
      }

      // Update profile
      const updatePayload = {
        ...data,
        ...(avatarUploadUrl ? { avatarUrl: avatarUploadUrl } : {}),
      };

      await new Promise<void>((resolve, reject) => {
        updateProfile(updatePayload, {
          onSuccess: () => resolve(),
          onError: error => reject(error),
        });
      });

      toast.alert(
        MESSAGES.UPDATE_SUCCESS,
        MESSAGES.PROFILE_UPDATE_SUCCESS,
        [],
        {
          type: ToastType.SUCCESS,
        },
      );
    } catch (error) {
      toast.alert(
        ERROR_MESSAGES.UPDATE_FAILED,
        error instanceof Error
          ? error.message
          : ERROR_MESSAGES.UPDATE_PROFILE_FAILED,
        [],
        { type: ToastType.ERROR },
      );
    }
  };

  return (
    <StyledSafeAreaView
      edges={['bottom']}
      className="flex-1 bg-bg-primary"
      accessibilityLabel="Profile screen"
      accessibilityHint="Profile screen"
    >
      <StyledScrollView
        contentContainerClassName="flex-1 px-6 pb-16"
        showsVerticalScrollIndicator={false}
      >
        <EditProfileForm
          userInfo={profile}
          isPending={isLoading}
          onSubmit={handleSubmit}
        />
      </StyledScrollView>
    </StyledSafeAreaView>
  );
};

export default EditProfileScreen;
