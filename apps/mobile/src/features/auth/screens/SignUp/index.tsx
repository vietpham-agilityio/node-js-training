// Hooks
import { useSignUp } from '@/features/auth/hooks/useSignUp';

// Types
import { SignUpData } from '@/features/auth/types/auth';

// Components
import { SignUpForm } from '@/features/auth/components/SignUpForm';

// Layout
import { AccessLayout } from '@/layouts/AccessLayout';

const SignupScreen = () => {
  const { mutate: signUp, isPending: isSigningUp } = useSignUp();

  const handleSubmit = (data: SignUpData) => {
    signUp(data);
  };

  return (
    <AccessLayout mode="signup" loading={isSigningUp}>
      <SignUpForm isPending={isSigningUp} onSubmit={handleSubmit} />
    </AccessLayout>
  );
};

export default SignupScreen;
