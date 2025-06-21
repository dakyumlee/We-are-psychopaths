export default async function handler(req, res) {

    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
    if (req.method === 'OPTIONS') {
      return res.status(200).end();
    }
  
    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Method not allowed' });
    }
  
    try {
      const { messages, userId } = req.body;
  
      if (!messages || !Array.isArray(messages)) {
        return res.status(400).json({ error: 'Messages array is required' });
      }
  
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': process.env.ANTHROPIC_API_KEY,
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
  
      if (!response.ok) {
        const errorData = await response.text();
        console.error('Claude API Error:', errorData);
        return res.status(response.status).json({ 
          error: 'Claude API request failed',
          details: errorData
        });
      }
  
      const data = await response.json();
      
      const assistantMessage = data.content[0]?.text || '죄송해요, 응답을 생성할 수 없었어요.';
  
      return res.status(200).json({
        message: assistantMessage,
        userId: userId
      });
  
    } catch (error) {
      console.error('Chat API Error:', error);
      return res.status(500).json({ 
        error: 'Internal server error',
        details: error.message 
      });
    }
  }