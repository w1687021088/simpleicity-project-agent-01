import { useEffect, useRef, useState, type FormEvent } from 'react';
import { Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

const MAX_TEXTAREA_HEIGHT = 120;

export default function HomePage() {
  const [message, setMessage] = useState('');
  const canSubmit = message.trim().length > 0;
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const textarea = textareaRef.current;

    if (!textarea) return;

    textarea.style.height = 'auto';

    const nextHeight = Math.min(textarea.scrollHeight, MAX_TEXTAREA_HEIGHT);
    textarea.style.height = `${nextHeight}px`;
    textarea.style.overflowY =
      textarea.scrollHeight > MAX_TEXTAREA_HEIGHT ? 'auto' : 'hidden';
  }, [message]);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!canSubmit) return;

    setMessage('');
  };

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="min-h-0 flex-1 space-y-4 overflow-y-auto pb-6">
        <h1 className="text-2xl font-semibold tracking-tight">首页</h1>
        <p className="text-muted-foreground">欢迎回来。</p>
      </div>

      <div className="shrink-0">
        <form className="flex items-end gap-2 pt-4" onSubmit={handleSubmit}>
          <Textarea
            ref={textareaRef}
            rows={1}
            value={message}
            onChange={(event) => setMessage(event.target.value)}
            placeholder="输入消息..."
            aria-label="聊天消息"
            className="max-h-[7.75rem]"
          />
          <Button
            type="submit"
            size="icon-lg"
            disabled={!canSubmit}
            aria-label="发送消息"
            className="self-end"
          >
            <Send className="size-4" />
          </Button>
        </form>
      </div>
    </div>
  );
}
