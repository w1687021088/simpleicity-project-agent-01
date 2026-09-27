import { Button } from '@/components/ui/button.tsx';

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
    </>
  );
}

export default App;
