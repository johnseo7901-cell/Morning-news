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

  // 구글이 강제하는 단 하나의 현역 모델
  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent?key=${apiKey}`;

  const prompt = `삼성E&A(Samsung E&A, 구 삼성엔지니어링)의 글로벌 플랜트 수주, 입찰, FEED, EPC 계약 동향 브리핑 데이터를 생성해 줘.
핵심 국가 및 발주처 대상: 사우디아라비아(Aramco, SABIC), UAE(ADNOC), 카타르(QE), 바레인(Bapco), 쿠웨이트(KOC/KNPC), 인도(ACME), 멕시코(Mexinol), 호주/인도네시아(INPEX).

반드시 마크다운 백틱 없이 순수 JSON 배열만 반환할 것:
[
  {
    "id": "card-1",
    "deepLink": "?card=card-1",
    "category": "수주",
    "client": "사우디 Aramco",
    "title": "삼성E&A 수주/입찰 핵심 동향 요약 제목",
    "titleEn": "Project Tender & Award Briefing",
    "summary": [
      "프로젝트 진행 현황 및 패키지 주요 내역",
      "발주처 협의 및 입찰 평가 진행 일정",
      "사업 수주 시 기대 파급 효과 및 계약 규모"
    ],
    "source": "E&P 전문지",
    "publishedAt": "2026-09-22",
    "url": "https://www.samsungena.com"
  }
]
`;

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }]
        // 429 Quota 에러를 유발하는 tools 검색 필드를 완전히 제거했습니다.
      })
    });

    const result = await response.json();

    if (result.error) {
      console.error('Gemini API 에러 상세:', JSON.stringify(result.error, null, 2));
      process.exit(1);
    }

    if (!result.candidates || result.candidates.length === 0) {
      console.error('응답 결과 없음:', JSON.stringify(result, null, 2));
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
    console.log('news.json 생성 및 갱신 완료!');
  } catch (error) {
    console.error('스크립트 실행 실패:', error);
    process.exit(1);
  }
}

getNewsData();
