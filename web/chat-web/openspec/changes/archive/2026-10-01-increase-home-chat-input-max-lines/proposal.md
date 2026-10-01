# Proposal

## Why

首页聊天输入框当前最多扩展到约 5 行，输入较长消息时过早进入内部滚动。将上限提高到约 7 行，可以减少编辑长消息时的滚动操作，同时仍限制输入区对上方聊天区域的挤占。

## What Changes

- 将首页聊天输入框的最大展开高度从约 5 行调整为约 7 行。
- 内容在 7 行以内时继续随内容自动增高。
- 内容超过约 7 行后停止增高，并在输入框内部滚动。
- 保持输入区作为 flex 最后一个 `shrink-0` 子元素、按钮右下对齐以及上方区域可压缩滚动的现有行为。

## Capabilities

### New Capabilities

无。

### Modified Capabilities

- `home-chat-input`: 将输入框最大展开高度从约 5 行调整为约 7 行。

## Impact

- 影响 `src/pages/Home/index.tsx` 中的最大高度常量和 `Textarea` 最大高度样式。
- 不涉及 API、路由、鉴权、依赖或数据持久化变更。
