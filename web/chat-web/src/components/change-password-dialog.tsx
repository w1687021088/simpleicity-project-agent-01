import React, { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { toast } from '@/components/ui/toast';

import { ApiError } from '@/utils/http';
import { forceLogout } from '@/utils/auth';
import { changePassword } from '@/apis';

interface ChangePasswordDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const INITIAL = {
  old_password: '',
  new_password: '',
  confirm_new_password: '',
};

export default function ChangePasswordDialog({
  open,
  onOpenChange,
}: ChangePasswordDialogProps) {
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState(INITIAL);
  const [error, setError] = useState<string | null>(null);

  const set = <K extends keyof typeof INITIAL>(key: K, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    if (error) setError(null);
  };

  const handleOpenChange = (v: boolean) => {
    if (loading) return;
    if (!v) {
      setForm(INITIAL);
      setError(null);
    }
    onOpenChange(v);
  };

  const handleSubmit = async (e: React.SyntheticEvent) => {
    e.preventDefault();
    setError(null);

    if (form.new_password !== form.confirm_new_password) {
      setError('两次输入的新密码不一致');
      return;
    }

    setLoading(true);
    try {
      await changePassword({
        old_password: form.old_password,
        new_password: form.new_password,
        confirm_new_password: form.confirm_new_password,
      });

      setForm(INITIAL);
      onOpenChange(false);

      toast.add({
        title: '密码修改成功',
        description: '请使用新密码重新登录',
        type: 'success',
      });
      forceLogout(800);
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError('网络异常，请稍后重试');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>修改密码</DialogTitle>
          <DialogDescription>输入旧密码，并设置一个新密码。</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="old_password">旧密码</Label>
            <Input
              id="old_password"
              type="password"
              autoComplete="current-password"
              value={form.old_password}
              onChange={(e) => set('old_password', e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="new_password">新密码</Label>
            <Input
              id="new_password"
              type="password"
              autoComplete="new-password"
              value={form.new_password}
              onChange={(e) => set('new_password', e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirm_new_password">确认新密码</Label>
            <Input
              id="confirm_new_password"
              type="password"
              autoComplete="new-password"
              value={form.confirm_new_password}
              onChange={(e) => set('confirm_new_password', e.target.value)}
            />
          </div>

          {error && (
            <div
              role="alert"
              className="rounded-md border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive"
            >
              {error}
            </div>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
              disabled={loading}
            >
              取消
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? '提交中…' : '确认修改'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
