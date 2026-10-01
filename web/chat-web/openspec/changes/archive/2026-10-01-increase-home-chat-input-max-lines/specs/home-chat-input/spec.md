# Spec Delta

## MODIFIED Requirements

### Requirement: 输入区高度由内容决定

聊天输入区 SHALL 根据内容决定高度，不预留固定高度；仅一行内容时，输入区高度 SHALL 为单行高度。

#### Scenario: 输入单行内容

- **WHEN** 用户输入一行文本
- **THEN** 输入区高度等于单行高度
- **AND** 输入区不显示额外预留空白

#### Scenario: 输入多行内容

- **WHEN** 用户换行或输入内容超过一行高度
- **THEN** 输入区随内容增加高度
- **AND** 上方聊天区域允许被压缩

#### Scenario: 内容超过最大高度

- **WHEN** 输入内容超过约七行高度
- **THEN** 输入字段停止增加高度
- **AND** 超出内容在输入字段内部滚动
