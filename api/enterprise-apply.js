import crypto from 'crypto';

function genSign(secret, timestamp) {
  const stringToSign = timestamp + "\n" + secret;
  const hash = crypto.createHmac('sha256', stringToSign).digest();
  return hash.toString('base64');
}

const SERVICE_TYPE_LABELS = {
  filing: 'AI备案辅导',
  review: '营销合规审查',
  assessment: '数据安全评估',
  training: '合规培训',
  checkup: '合规体检',
  other: '其他服务'
};

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, msg: 'Method Not Allowed' });
  }

  try {
    const { companyName, serviceType, serviceDesc, contactPhone } = req.body;

    if (!companyName || !serviceType || !contactPhone) {
      return res.status(400).json({
        success: false,
        msg: '企业名称、服务类型和联系方式为必填项'
      });
    }

    const secret = process.env.FEISHU_SIGN_SECRET;
    const webhookUrl = process.env.FEISHU_WEBHOOK_URL;

    if (!secret || !webhookUrl) {
      console.error('环境变量缺失:', {
        hasSecret: !!secret,
        hasWebhook: !!webhookUrl
      });
      return res.status(500).json({
        success: false,
        msg: '服务器配置错误，请联系管理员'
      });
    }

    const timestamp = Math.floor(Date.now() / 1000);
    const sign = genSign(secret, timestamp);
    const serviceTypeLabel = SERVICE_TYPE_LABELS[serviceType] || serviceType;

    const feishuPayload = {
      timestamp: timestamp.toString(),
      sign,
      msg_type: 'post',
      content: {
        post: {
          zh_cn: {
            title: '🏢 收到新的企业合规咨询',
            content: [
              [{ tag: 'text', text: `🏭企业名称：${companyName}` }],
              [{ tag: 'text', text: `🧩服务类型：${serviceTypeLabel}` }],
              [{ tag: 'text', text: `📞联系方式：${contactPhone}` }],
              [{ tag: 'text', text: `📝需求描述：${serviceDesc || '未填写'}` }],
              [{ tag: 'text', text: `⌚提交时间：${new Date().toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai' })}` }]
            ]
          }
        }
      }
    };

    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(feishuPayload)
    });

    const result = await response.json();

    if (result.code === 0) {
      return res.status(200).json({ success: true, msg: '提交成功' });
    }

    console.error('飞书返回错误:', result);
    return res.status(500).json({
      success: false,
      msg: result.msg || '提交失败，请稍后重试'
    });
  } catch (error) {
    console.error('Enterprise apply API error:', error);
    return res.status(500).json({
      success: false,
      msg: '服务器错误：' + error.message
    });
  }
}
