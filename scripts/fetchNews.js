import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function getNewsData() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error('에러: GEMINI_API_KEY 환경변수가 설정되지 않았습니다.');
    process.exit(1);
  }

  // gemini-3.6-flash 모델 엔드포인트 적용
  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent?key=${apiKey}`;

  const prompt = `지난 24시간 동안 보도된 '삼성E&A(Samsung E&A, 삼성엔지니어링)'의 글로벌 수주, 입찰, FEED, 계약 소식을 검색하고 정리해 줘.
필수 모니터링 대상: 사우디 아람코(Aramco)/SABIC, UAE ADNOC, 카타르 QE, 바레인 Bapco, 쿠웨이트 KOC/KNPC, 인도 ACME, 멕시코 Mexinol, 호주/인니 INPEX.

반드시 마크다운 백틱 없이 순수 JSON 배열만 반환할 것:
[
  {
    "id": "card-1",
    "deepLink": "?card=card-1",
    "category": "수주/입찰/FEED 중 택1",
    "client": "국가 및 발주처",
    "title": "국문 요약 제목",
    "titleEn": "영문 원문 제목",
    "summary": ["핵심 요약 1", "핵심 요약 2", "핵심 요약 3"],
    "source": "언론사",
    "publishedAt": "발행일시",
    "url": "원문 기사 URL"
  }
]
해당 뉴스가 없으면 빈 배열 [] 만 출력할 것.`;

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        tools: [{ googleSearch: {} }]
      })
    });

    const result = await response.json();

    if (result.error) {
      console.error('Gemini API 반환 에러 상세:', JSON.stringify(result.error, null, 2));
      process.exit(1);
    }

    if (!result.candidates || result.candidates.length === 0) {
      console.error('후보 응답이 없습니다. API 전체 응답:', JSON.stringify(result, null, 2));
      process.exit(1);
    }

    let text = result.candidates[0].content.parts[0].text.trim();
    if (text.startsWith('```json')) text = text.replace(/^```json/, '').replace(/```$/, '').trim();
    else if (text.startsWith('```')) text = text.replace(/^```/, '').replace(/```$/, '').trim();

    const publicDir = path.join(__dirname, '../public');
    if (!fs.existsSync(publicDir)) {
      fs.mkdirSync(publicDir, { recursive: true });
    }

    const outputPath = path.join(publicDir, 'news.json');
    fs.writeFileSync(outputPath, text, 'utf-8');
    console.log('news.json 업데이트 완료!');
  } catch (error) {
    console.error('스크립트 실행 에러:', error);
    process.exit(1);
  }
}

getNewsData();
