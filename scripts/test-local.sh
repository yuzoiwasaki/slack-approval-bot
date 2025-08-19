#!/bin/bash

echo "🚀 Slack承認ワークフローボット - ローカルテスト環境を起動します"

# 環境変数ファイルの確認
if [ ! -f .env ]; then
    echo "❌ .envファイルが見つかりません。env.exampleをコピーして設定してください。"
    exit 1
fi

# ngrokの起動
echo "📡 ngrokを起動中..."
ngrok http 3000 > /dev/null 2>&1 &
NGROK_PID=$!

# ngrokの起動を待つ
sleep 3

# ngrokのURLを取得
NGROK_URL=$(curl -s http://localhost:4040/api/tunnels | jq -r '.tunnels[0].public_url' 2>/dev/null)

if [ -z "$NGROK_URL" ] || [ "$NGROK_URL" = "null" ]; then
    echo "❌ ngrokの起動に失敗しました。"
    kill $NGROK_PID 2>/dev/null
    exit 1
fi

echo "✅ ngrokが起動しました: $NGROK_URL"
echo "📝 Slack AppのEvent Subscriptionsで以下のURLを設定してください:"
echo "   $NGROK_URL/slack/events"
echo ""
echo "🔄 ボットを起動中..."

# ボットの起動
npm start

# クリーンアップ
echo "🧹 クリーンアップ中..."
kill $NGROK_PID 2>/dev/null
echo "✅ ローカルテスト環境を終了しました"
