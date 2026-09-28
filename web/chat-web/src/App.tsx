import { Suspense } from 'react';
import { Spinner } from '@/components/ui/spinner';
import { AuthProvider } from '@/stores/auth';
import AppRouter from '@/router';

function App() {
  return (
    <AuthProvider>
      <Suspense
        fallback={
          <div className="flex h-screen items-center justify-center">
            <Spinner className="size-8" />
          </div>
        }
      >
        <AppRouter />
      </Suspense>
    </AuthProvider>
  );
}

export default App;
