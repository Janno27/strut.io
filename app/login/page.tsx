import { LoginForm } from "../components/auth/login-form";

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8 bg-white dark:bg-gray-900 p-8 rounded-lg shadow-lg">
        <LoginForm />
      </div>
    </div>
  );
} 