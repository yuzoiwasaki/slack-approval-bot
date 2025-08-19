# Slack承認ワークフローBot

内部統制目的でSlackのスタンプをベースとした承認ワークフローを実現するBotです。

## 使用方法

1. 申請者は申請用チャンネルに承認を求める内容を投稿
2. 承認者は該当メッセージに承認スタンプを押す
3. Botが自動的に承認ログチャンネルに承認ログを投稿

## 承認ログの内容

- 申請者
- 申請内容
- 承認者
- 承認日時

## セットアップ

### 1. 依存関係のインストール

```bash
npm install
```

### 2. 環境変数の設定

`env.example` を参考に `.env` ファイルを作成し、必要な値を設定してください。

```bash
cp env.example .env
```

#### 必要な環境変数

- `SLACK_BOT_TOKEN`: Slack Bot User OAuth Token (xoxb-...)
- `SLACK_SIGNING_SECRET`: Slack App の署名シークレット
- `APPROVER_IDS`: 承認者のSlack ID（カンマ区切り）
- `LOG_CHANNEL_ID`: 承認ログを投稿するチャンネルのID（例: C1234567890）
- `APPROVAL_STAMP`: 承認用スタンプ名（デフォルト: white_check_mark）
- `APPROVAL_CHANNELS`: 承認ワークフローを適用するチャンネル（カンマ区切り、デフォルト: system_development_request）
- `PORT`: サーバーポート（デフォルト: 3000）

**注意**: `APPROVER_IDS`と`LOG_CHANNEL_ID`は必須設定です。設定されていない場合、ボットは起動しません。

#### チャンネルIDの取得方法

1. **Slackでチャンネルを開く**
2. **チャンネル名をクリック** → **「チャンネルの詳細」**
3. **「その他」** → **「チャンネルIDをコピー**」
4. **`C`で始まる文字列**（例: `C1234567890`）がチャンネルIDです

**注意**: チャンネル名ではなく、チャンネルIDを使用してください。

### 3. Slack App の設定

1. [Slack API](https://api.slack.com/apps) で新しいアプリを作成
2. 以下の権限を設定：
   - **Bot Token Scopes**:
     - `channels:history` - チャンネルのメッセージ履歴を読み取り
     - `chat:write` - メッセージを送信
     - `reactions:read` - リアクションを読み取り
3. アプリをワークスペースにインストール
4. Bot User OAuth Token と Signing Secret を取得

### 4. 起動

```bash
npm start
```

## ローカルテスト

### 前提条件

- Slack Appの設定が完了していること
- 必要な環境変数が`.env`ファイルに設定されていること
- ngorkの設定が完了していること

### テスト手順

1. **ターミナル1**: ngrokを起動
   ```bash
   npm run ngrok
   # または
   ngrok http 3000
   ```

2. **ターミナル2**: Botを起動
   ```bash
   npm start
   ```

3. **Slack App設定**: Event SubscriptionsでngrokのURLを設定
   ```
   https://abc123.ngrok.io/slack/events
   ```

4. **テスト実行**: Slackで承認ワークフローをテスト
