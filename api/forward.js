import crypto from 'crypto';

// 签名校验函数
function genSign(secret, timestamp) {
  const stringToSign = timestamp + "\n" + secret;
  const hash = crypto.createHmac('sha256', stringToSign).digest();
  return hash.toString('base64');
}

export default async function handler(req, res) {
  // 添加 CORS 头
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // 处理 OPTIONS 预检请求
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, msg: 'Method Not Allowed' });
  }

  try {
    const { productName, productDesc, contactPhone } = req.body;
    
    // 验证必填字段
    if (!productName || !contactPhone) {
      return res.status(400).json({ 
        success: false, 
        msg: '产品名称和联系方式为必填项' 
      });
    }

    const secret = process.env.FEISHU_SIGN_SECRET;
    const webhookUrl = process.env.FEISHU_WEBHOOK_URL;

    // 检查环境变量
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

    // 1. 准备签名参数
    const timestamp = Math.floor(Date.now() / 1000); // 飞书要求的秒级时间戳
    const sign = genSign(secret, timestamp);

    // 2. 构造带签名的飞书 Payload
    const feishuPayload = {
      timestamp: timestamp.toString(), // 必须是字符串
      sign: sign,
      msg_type: "post",
      content: {
        post: {
          zh_cn: {
            title: "🛡️ 收到新的客户咨询",
            content: [
              [{ tag: "text", text: `💡产品名称：${productName}` }],
              [{ tag: "text", text: `📞联系方式：${contactPhone}` }],
              [{ tag: "text", text: `📝产品介绍：${productDesc || '未填写'}` }],
              [{ tag: "text", text: `⌚提交时间：${new Date().toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai' })}` }]
            ]
          }
        }
      }
    };

    console.log('准备发送飞书消息:', {
      timestamp,
      hasSign: !!sign,
      webhookUrl: webhookUrl.substring(0, 50) + '...'
    });

    // 3. 发送请求到飞书
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(feishuPayload),
    });

    const result = await response.json();
    console.log('飞书响应:', result);

    if (result.code === 0) {
      return res.status(200).json({ 
        success: true, 
        msg: '提交成功' 
      });
    } else {
      console.error('飞书返回错误:', result);
      return res.status(500).json({ 
        success: false, 
        msg: result.msg || '提交失败，请稍后重试' 
      });
    }
  } catch (error) {
    console.error('Server Error:', error);
    return res.status(500).json({ 
      success: false, 
      msg: '服务器错误：' + error.message 
    });
  }
}