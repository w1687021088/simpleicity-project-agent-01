# Proposal

## Why

首页当前只有欢迎内容，缺少任何可输入消息的聊天入口，用户无法在此页面开始对话。需要补充底部多行聊天输入区，并按类 DeepSeek 风格组织上方可压缩、可滚动的聊天区域。

## What Changes

- 在首页内容区底部新增多行聊天输入区，使用 `Textarea` 替代 `Input`。
- 输入区作为首页 flex 布局最后一个 `shrink-0` 子元素，高度由内容决定，不设置固定高度；仅一行内容时即为单行高度。
- 输入框内容超过一行时自动扩展，最多约 5 行；超出后在输入框内部滚动。
- 上方聊天区域使用 `flex-1 min-h-0 overflow-y-auto`，允许因输入区扩展而被压缩，但内容仍可滚动查看。
- 提供发送按钮；回车用于换行，点击发送按钮触发表单提交。
- 发送按钮使用 `align-self: flex-end` 固定在输入区右下角。
- 输入为空时禁用发送，提交后清空当前输入并恢复单行高度。
- 本次仅实现前端输入与提交交互，不接入消息列表、历史记录或聊天接口。

## Capabilities

### New Capabilities

- `home-chat-input`: 首页聊天输入框的展示、布局与基础输入提交行为。

### Modified Capabilities

无。

## Impact

- 影响 `src/pages/Home/index.tsx`；可能调整 `src/layouts/MainLayout.tsx` 的主内容区，使首页可使用剩余高度并将输入区固定到底部。
- 新增 `src/components/ui/textarea.tsx`，复用 `src/components/ui/button.tsx`，不新增运行时依赖。
- 不涉及路由、鉴权、API、环境变量或数据持久化变更。
