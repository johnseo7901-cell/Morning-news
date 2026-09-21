import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function getNewsData() {
  const apiKey = process.env.GEMINI_API_KEY;
  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;

  const prompt = `지난 24시간 동안 전 세계 주요 언론 및 플랜트 전문 매체에 보도된 '삼성E&A(Samsung E&A, 삼성엔지니어링)' 관련 수주, 입찰, FEED, 계약 관련 기사를 검색해 줘.
필수 모니터링: 사우디(Aramco, SABIC), UAE(ADNOC), 카타르(QE), 바레인(Bapco), 쿠웨이트(KOC/KNPC), 인도(ACME), 멕시코(Mexinol), 호주/인니(INPEX).

반드시 아래 규격의 JSON 배열만 순수 텍스트(마크다운 백틱 제외)로 응답할 것:
[
  {
    "id": "card-1",
    "deepLink": "?card=card-1",
    "category": "수주/입찰/FEED 중 택1",
    "client": "국가 및 발주처명",
    "title": "기사 국문 요약 제목",
    "titleEn": "기사 원문 제목",
    "summary": ["핵심 요약 불릿 1", "핵심 요약 불릿 2", "핵심 요약 불릿 3"],
    "source": "언론사명",
    "publishedAt": "발행 일시",
    "url": "해당 기사 본문 상세페이지 전체 URL"
  }
]
기사가 없으면 빈 배열 [] 로 응답할 것.`;

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
    let text = result.candidates[0].content.parts[0].text.trim();
    if (text.startsWith('```json')) text = text.replace(/^```json/, '').replace(/```$/, '').trim();
    else if (text.startsWith('```')) text = text.replace(/^```/, '').replace(/```$/, '').trim();

    const outputPath = path.join(__dirname, '../public/news.json');
    fs.writeFileSync(outputPath, text, 'utf-8');
    console.log('news.json 업데이트 성공!');
  } catch (error) {
    console.error('에러 발생:', error);
    process.exit(1);
  }
}

getNewsData();
