import crypto from 'crypto';

function genSign(secret, timestamp) {
  const stringToSign = timestamp + "\n" + secret;
  const hash = crypto.createHmac('sha256', stringToSign).digest();
  return hash.toString('base64');
}

const COOPERATION_TYPE_LABELS = {
  project: '课题合作',
  internship: '实习合作',
  research: '研究合作',
  lab: '联合实验室',
  other: '其他合作'
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
    const { universityName, department, cooperationType, cooperationDesc, contactPhone } = req.body;

    if (!universityName || !department || !cooperationType || !contactPhone) {
      return res.status(400).json({
        success: false,
        msg: '高校名称、院系/部门、合作意向和联系方式为必填项'
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
    const cooperationTypeLabel = COOPERATION_TYPE_LABELS[cooperationType] || cooperationType;

    const feishuPayload = {
      timestamp: timestamp.toString(),
      sign,
      msg_type: 'post',
      content: {
        post: {
          zh_cn: {
            title: '🎓 收到新的高校合作咨询',
            content: [
              [{ tag: 'text', text: `🏫高校名称：${universityName}` }],
              [{ tag: 'text', text: `🏢院系/部门：${department}` }],
              [{ tag: 'text', text: `🤝合作意向：${cooperationTypeLabel}` }],
              [{ tag: 'text', text: `📞联系方式：${contactPhone}` }],
              [{ tag: 'text', text: `📝合作需求：${cooperationDesc || '未填写'}` }],
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
    console.error('University apply API error:', error);
    return res.status(500).json({
      success: false,
      msg: '服务器错误：' + error.message
    });
  }
}
