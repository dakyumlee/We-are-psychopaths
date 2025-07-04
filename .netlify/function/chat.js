const fetch = require('node-fetch');

exports.handler = async (event, context) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    const { messages, userId } = JSON.parse(event.body);

    if (!messages || !Array.isArray(messages)) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Messages array is required' })
      };
    }

    const API_KEY = process.env.ANTHROPIC_API_KEY;
    if (!API_KEY) {
      console.error('ANTHROPIC_API_KEY not found');
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ error: 'API key not configured' })
      };
    }

    console.log('API 키 확인됨:', API_KEY.substring(0, 20) + '...');

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 1000,
        messages: messages,
        system: `당신은 조현병 관련 사이트의 따뜻하고 공감적인 AI 상담사입니다. 

주요 역할:
1. 정서적 지원과 공감적 경청
2. 위기 상황 감지 시 전문기관 연결 (119, 129)
3. 일상 관리 도움 (수면, 식사, 약물 복용 등)
4. 사이트 내 콘텐츠 안내 (일기, 커뮤니티, 정보 페이지)

대화 원칙:
- 따뜻하고 공감적인 톤 유지
- 전문의 상담을 대체할 수 없음을 항상 명시
- 자해/자살 관련 언급 시 즉시 전문기관 안내
- 혼자가 아니라는 안정감 제공
- 작은 일상적 관심도 소중히 여기기

위기 상황 키워드: 죽고싶다, 자살, 자해, 해치고싶다, 끝내고싶다 등
이런 표현 감지 시 "지금 많이 힘드시겠어요. 혼자 견디지 마시고 전문가의 도움을 받으세요. 정신건강 상담전화 129번이나 응급상황 시 119에 연락하세요."

한국어로 대화하며, 존댓말을 사용합니다.`
      })
    });

    console.log('Anthropic API 응답 상태:', response.status);

    if (!response.ok) {
      const errorData = await response.text();
      console.error('Claude API Error:', response.status, errorData);
      return {
        statusCode: response.status,
        headers,
        body: JSON.stringify({ 
          error: 'Claude API request failed',
          details: errorData,
          status: response.status
        })
      };
    }

    const data = await response.json();
    const assistantMessage = data.content[0]?.text || '죄송해요, 응답을 생성할 수 없었어요.';

    console.log('응답 성공:', assistantMessage.substring(0, 50) + '...');

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        message: assistantMessage,
        userId: userId
      })
    };

  } catch (error) {
    console.error('Chat API Error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        error: 'Internal server error',
        details: error.message 
      })
    };
  }
};