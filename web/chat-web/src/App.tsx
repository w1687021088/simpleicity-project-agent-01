import { Button } from '@/components/ui/button.tsx';
import { getUserInfo } from '@/apis/user';

const apiUrl = import.meta.env.VITE_API_BASE_URL;
const appTitle = import.meta.env.VITE_APP_TITLE;

console.log(`API URL: ${apiUrl}`);
console.log(`App Title: ${appTitle}`);

function App() {
  return (
    <>
      <div className="mt-3.5 flex w-full items-center justify-center gap-4">
        <Button variant="outline" onClick={getUserInfo}>
          测试
        </Button>
      </div>
    </>
  );
}

export default App;
