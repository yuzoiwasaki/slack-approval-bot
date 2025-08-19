# Slack承認ワークフローボット

内部統制目的でSlackのスタンプをベースとした承認ワークフローを実現するボットです。

## 機能

- 申請用チャンネルで申請者が承認してもらいたい内容をポスト
- 承認者は問題なければ承認スタンプ（✅）を押す
- 承認スタンプをフックとして、指定チャンネルに承認ログを自動投稿
- 承認ログはBot投稿なので改変・削除不可
- 特定チャンネルや特定スタンプ以外は発火しない
- 承認者はあらかじめ指定可能

## 承認ログの内容

- 承認日時
- 承認内容（元の投稿内容）
- 承認者
- 投稿者

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
- `LOG_CHANNEL_ID`: 承認ログを投稿するチャンネルのID
- `APPROVAL_STAMP`: 承認用スタンプ名（デフォルト: white_check_mark）
- `APPROVAL_CHANNELS`: 承認ワークフローを適用するチャンネル（カンマ区切り、デフォルト: system_development_request）
- `PORT`: サーバーポート（デフォルト: 3000）

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
# 本番環境
npm start

# 開発環境（ファイル変更時に自動再起動）
npm run dev
```

## 使用方法

1. 申請者は申請用チャンネルに承認を求める内容を投稿
2. 承認者は該当メッセージに承認スタンプ（✅）を押す
3. ボットが自動的に承認ログチャンネルに承認ログを投稿

## ローカルテスト

### 前提条件

- Slack Appの設定が完了していること
- 必要な環境変数が`.env`ファイルに設定されていること

### テスト手順

#### 方法1: 自動スクリプト（推奨）

```bash
npm run test:local
```

#### 方法2: 手動実行

1. **ターミナル1**: ngrokを起動
   ```bash
   npm run ngrok
   # または
   ngrok http 3000
   ```

2. **ターミナル2**: ボットを起動
   ```bash
   npm start
   ```

3. **Slack App設定**: Event SubscriptionsでngrokのURLを設定
   ```
   https://abc123.ngrok.io/slack/events
   ```

4. **テスト実行**: Slackで承認ワークフローをテスト

## 設定例

### 承認スタンプの変更

`.env` ファイルで `APPROVAL_STAMP` を変更することで、使用するスタンプを変更できます。

```bash
# 例：+1スタンプを使用
APPROVAL_STAMP=+1

# 例：eyesスタンプを使用
APPROVAL_STAMP=eyes
```

### 承認者の追加・削除

`.env` ファイルで `APPROVER_IDS` を編集することで、承認者を管理できます。

```bash
# 例：3名の承認者を設定
APPROVER_IDS=U12345678,U87654321,U11111111
```

### 承認対象チャンネルの設定

`.env` ファイルで `APPROVAL_CHANNELS` を編集することで、承認ワークフローを適用するチャンネルを管理できます。

```bash
# 例：単一チャンネルのみ
APPROVAL_CHANNELS=system_development_request

# 例：複数チャンネルを指定
APPROVAL_CHANNELS=system_development_request,project_approval,expense_approval
```

## トラブルシューティング

### よくある問題

1. **ボットが起動しない**
   - 環境変数が正しく設定されているか確認
   - Slack App の権限設定を確認

2. **承認スタンプが反応しない**
   - Bot Token Scopes に `reactions:read` が含まれているか確認
   - 承認者のSlack ID が正しく設定されているか確認

3. **ログが投稿されない**
   - ログチャンネルのID が正しく設定されているか確認
   - ボットがログチャンネルに参加しているか確認

## ライセンス

MIT License
