require('dotenv').config();
const { App } = require('@slack/bolt');

// Slack App の初期化
const app = new App({
  token: process.env.SLACK_BOT_TOKEN,
  signingSecret: process.env.SLACK_SIGNING_SECRET
});

// 承認を許可するユーザーのSlack ID（環境変数から取得）
const APPROVER_IDS = process.env.APPROVER_IDS ? 
  process.env.APPROVER_IDS.split(',') : 
  [];

// 承認用スタンプ名（環境変数から取得）
const APPROVAL_STAMP = process.env.APPROVAL_STAMP || 'white_check_mark';

// 承認ログ投稿先チャンネル（環境変数から取得）
const LOG_CHANNEL_ID = process.env.LOG_CHANNEL_ID || '';

// 承認対象チャンネル（環境変数から取得、デフォルトはsystem_development_request）
const APPROVAL_CHANNELS = process.env.APPROVAL_CHANNELS ? 
  process.env.APPROVAL_CHANNELS.split(',') : 
  ['system_development_request'];

// reaction_added イベントの検知
app.event('reaction_added', async ({ event, client, logger }) => {
  const { reaction, user, item } = event;

  try {
    // 特定チャンネルでのみ動作するように制限
    if (!APPROVAL_CHANNELS.includes(item.channel)) {
      logger.info(`対象外チャンネル(${item.channel})のため、処理をスキップします。`);
      return;
    }

    // 承認用スタンプかチェック
    if (reaction === APPROVAL_STAMP) {
      logger.info(`承認スタンプ(${reaction})が押されました。ユーザー: ${user}`);

      // 承認者かチェック
      if (!APPROVER_IDS.includes(user)) {
        logger.info(`非承認者(${user})がスタンプを押しました。無視します。`);
        return;
      }

      logger.info(`承認者(${user})による承認処理を開始します。`);

      // 承認されたメッセージ情報を取得
      const res = await client.conversations.history({
        channel: item.channel,
        latest: item.ts,
        inclusive: true,
        limit: 1
      });

      const message = res.messages?.[0];
      if (!message) {
        logger.error('メッセージの取得に失敗しました。');
        return;
      }

      // 承認ログを投稿
      const approvalLog = await client.chat.postMessage({
        channel: LOG_CHANNEL_ID,
        text: `✅ *承認ログ*\n` +
              `> 申請者: <@${message.user}>\n` +
              `> 申請内容: ${message.text}\n` +
              `> 承認者: <@${user}>\n` +
              `> 承認日時: ${new Date().toLocaleString('ja-JP', { timeZone: 'Asia/Tokyo' })}`,
        unfurl_links: false,
        unfurl_media: false
      });

      if (approvalLog.ok) {
        logger.info(`承認ログの投稿に成功しました。チャンネル: ${LOG_CHANNEL_ID}`);
      } else {
        logger.error(`承認ログの投稿に失敗しました: ${approvalLog.error}`);
      }
    }
  } catch (error) {
    logger.error('承認処理中にエラーが発生しました:', error);
  }
});

// エラーハンドリング
app.error((error) => {
  console.error('Slack App エラー:', error);
});

// 起動前の環境変数チェック
if (APPROVER_IDS.length === 0) {
  console.error('❌ エラー: APPROVER_IDSが設定されていません。.envファイルで承認者を設定してください。');
  process.exit(1);
}

if (!LOG_CHANNEL_ID) {
  console.error('❌ エラー: LOG_CHANNEL_IDが設定されていません。.envファイルでログチャンネルを設定してください。');
  process.exit(1);
}

// 起動
(async () => {
  try {
    await app.start(process.env.PORT || 3000);
    console.log('⚡️ Slack承認ワークフローボットが起動しました!');
    console.log(`📝 承認スタンプ: ${APPROVAL_STAMP}`);
    console.log(`👥 承認者数: ${APPROVER_IDS.length}名`);
    console.log(`📋 ログチャンネル: ${LOG_CHANNEL_ID}`);
    console.log(`🎯 承認対象チャンネル: ${APPROVAL_CHANNELS.join(', ')}`);
    console.log(`🌐 ポート: ${process.env.PORT || 3000}`);
  } catch (error) {
    console.error('起動エラー:', error);
    process.exit(1);
  }
})();
