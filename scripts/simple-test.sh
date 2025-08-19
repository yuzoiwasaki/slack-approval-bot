#!/bin/bash

echo "🚀 Slack承認ワークフローボット - ローカルテスト環境を起動します"

# 環境変数ファイルの確認
if [ ! -f .env ]; then
    echo "❌ .envファイルが見つかりません。env.exampleをコピーして設定してください。"
    exit 1
fi

echo "📡 ngrokを起動中..."
echo "📝 別のターミナルで以下のコマンドを実行してください:"
echo "   ngrok http 3000"
echo ""
echo "ngrokが起動したら、表示されるURLをコピーして"
echo "Slack AppのEvent Subscriptionsで設定してください。"
echo ""
echo "例: https://abc123.ngrok.io/slack/events"
echo ""
echo "準備ができたら、このターミナルで Enter キーを押してください..."

read -p "Press Enter to continue..."

echo "🔄 ボットを起動中..."
npm start
