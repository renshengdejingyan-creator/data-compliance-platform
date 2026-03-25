import crypto from 'crypto';

function genSign(secret, timestamp) {
  const stringToSign = timestamp + "\n" + secret;
  const hash = crypto.createHmac('sha256', stringToSign).digest();
  return hash.toString('base64');
}

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
    const { contactPhone, requirements } = req.body;

    // 验证必填字段
    if (!contactPhone || !requirements) {
      return res.status(400).json({
        success: false,
        msg: '联系方式和需求描述为必填项'
      });
    }

    // 验证手机号格式
    const phoneRegex = /^1[3-9]\d{9}$/;
    if (!phoneRegex.test(contactPhone)) {
      return res.status(400).json({
        success: false,
        msg: '请输入正确的手机号码格式'
      });
    }

    // 验证需求描述长度
    if (requirements.trim().length < 5) {
      return res.status(400).json({
        success: false,
        msg: '需求描述至少需要5个字'
      });
    }

    if (requirements.length > 500) {
      return res.status(400).json({
        success: false,
        msg: '需求描述不能超过500个字符'
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

    // 截断需求描述以适应飞书消息长度限制
    const truncatedRequirements = requirements.length > 200 
      ? requirements.substring(0, 200) + '...' 
      : requirements;

    const feishuPayload = {
      timestamp: timestamp.toString(),
      sign,
      msg_type: 'post',
      content: {
        post: {
          zh_cn: {
            title: '📋 收到新的需求调研',
            content: [
              [{ tag: 'text', text: `📞联系方式：${contactPhone}` }],
              [{ tag: 'text', text: `📝需求描述：${truncatedRequirements}` }],
              [{ tag: 'text', text: `⌚提交时间：${new Date().toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai' })}` }]
            ]
          }
        }
      }
    };

    console.log('准备发送需求调研消息:', {
      timestamp,
      hasSign: !!sign,
      contactPhone: contactPhone.substring(0, 3) + '****' + contactPhone.substring(7),
      requirementsLength: requirements.length
    });

    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(feishuPayload)
    });

    const result = await response.json();
    console.log('飞书响应:', result);

    if (result.code === 0) {
      return res.status(200).json({ 
        success: true, 
        msg: '提交成功' 
      });
    }

    console.error('飞书返回错误:', result);
    return res.status(500).json({
      success: false,
      msg: result.msg || '提交失败，请稍后重试'
    });
  } catch (error) {
    console.error('Survey API error:', error);
    return res.status(500).json({
      success: false,
      msg: '服务器错误：' + error.message
    });
  }
}
