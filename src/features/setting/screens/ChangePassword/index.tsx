// Components
import { ChangePasswordForm } from '@/features/setting/components/ChangePasswordForm';

// Layout
import { KeyboardLayout } from '@/layouts/KeyboardLayout';

const ChangePasswordScreen = () => (
  <KeyboardLayout
    contentPadding="px-6 pt-4"
    accessibilityLabel="Change Password screen"
    accessibilityHint="Change Password screen"
  >
    <ChangePasswordForm />
  </KeyboardLayout>
);

export default ChangePasswordScreen;
