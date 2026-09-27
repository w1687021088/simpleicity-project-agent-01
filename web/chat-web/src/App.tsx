import { Button } from '@/components/ui/button.tsx';
import { Spinner } from '@/components/ui/spinner';

const apiUrl = import.meta.env.VITE_API_BASE_URL;
const appTitle = import.meta.env.VITE_APP_TITLE;

console.log(`API URL: ${apiUrl}`);
console.log(`App Title: ${appTitle}`);

function App() {
  return (
    <>
      <div className="p-4">
        <Button>默认按钮</Button>
        <Button variant="outline">轮廓</Button>
        <Button variant="ghost">幽灵</Button>
        <Button variant="destructive">危险</Button>
        <Button size="sm">小号</Button>
        <Button size="lg">大号</Button>
        <Button disabled>禁用</Button>
      </div>
      <div className="flex items-center gap-4">
        <Spinner />
        <Spinner className="size-6" />
        <Spinner className="size-8 text-primary" />
        <Button disabled>
          <Spinner />
          加载中...
        </Button>
      </div>
    </>
  );
}

export default App;
