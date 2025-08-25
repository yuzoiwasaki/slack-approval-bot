require('dotenv').config();
const { App } = require('@slack/bolt');

const app = new App({
  token: process.env.SLACK_BOT_TOKEN,
  signingSecret: process.env.SLACK_SIGNING_SECRET
});

const APPROVER_IDS = process.env.APPROVER_IDS ? 
  process.env.APPROVER_IDS.split(',') : 
  [];

const APPROVAL_STAMP = process.env.APPROVAL_STAMP || 'white_check_mark';

const LOG_CHANNEL_ID = process.env.LOG_CHANNEL_ID || '';

const APPROVAL_CHANNELS = process.env.APPROVAL_CHANNELS ? 
  process.env.APPROVAL_CHANNELS.split(',') : 
  [];

function removeMentions(text) {
  return text.replace(/<@[^>]+>/g, '').trim();
}

app.event('reaction_added', async ({ event, client, logger }) => {
  const { reaction, user, item } = event;

  try {
    if (!APPROVAL_CHANNELS.includes(item.channel)) {
      logger.info(`対象外チャンネル(${item.channel})のため、処理をスキップします。`);
      return;
    }

    if (reaction === APPROVAL_STAMP) {
      logger.info(`承認スタンプ(${reaction})が押されました。ユーザー: ${user}`);

      if (!APPROVER_IDS.includes(user)) {
        logger.info(`非承認者(${user})がスタンプを押しました。無視します。`);
        return;
      }

      logger.info(`承認者(${user})による承認処理を開始します。`);

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

      const cleanContent = removeMentions(message.text);
      
      const approvalLog = await client.chat.postMessage({
        channel: LOG_CHANNEL_ID,
        text: `✅ *承認ログ*\n` +
              `> 申請者: <@${message.user}>\n` +
              `> 申請内容: ${cleanContent}\n` +
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

app.error((error) => {
  console.error('Slack App エラー:', error);
});

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
    console.log('⚡️ Slack承認ワークフローBotが起動しました!');
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
