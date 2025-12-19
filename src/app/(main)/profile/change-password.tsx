import { ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { withUniwind } from 'uniwind';

// Components
import { ChangePasswordForm } from '@/features/setting/components/ChangePasswordForm';

const StyledSafeAreaView = withUniwind(SafeAreaView);
const StyledScrollView = withUniwind(ScrollView);

const ChangePasswordScreen = () => {
  return (
    <StyledSafeAreaView
      edges={['bottom']}
      className="flex-1 bg-bg-primary"
      accessibilityLabel="Change Password screen"
      accessibilityHint="Change Password screen"
    >
      <StyledScrollView
        contentContainerClassName="flex-1 px-6 pt-4 pb-16"
        showsVerticalScrollIndicator={false}
      >
        <ChangePasswordForm />
      </StyledScrollView>
    </StyledSafeAreaView>
  );
};

export default ChangePasswordScreen;
