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

  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent?key=${apiKey}`;

  const prompt = `삼성E&A(Samsung E&A, 구 삼성엔지니어링) 및 글로벌 플랜트 EPC 업계의 최근 수주, 입찰, FEED, 계약 관련 실제 기사들을 바탕으로 모바일 카드뉴스 브리핑 데이터를 JSON으로 작성해 줘.
핵심 모니터링 대상 국가 및 발주처: 사우디아라비아(Aramco, SABIC), UAE(ADNOC), 카타르(QE), 바레인(Bapco), 쿠웨이트(KOC/KNPC), 인도(ACME), 멕시코(Mexinol), 호주/인도네시아(INPEX).

[필수 규칙]:
1. 'url' 항목에는 절대 발주처나 회사 대표 도메인 메인 주소(예: https://www.samsungena.com 등)를 넣지 말 것.
2. 반드시 해당 보도 기사가 실린 언론사(MEED, Oil & Gas Middle East, 연합뉴스, 한국경제 등)의 실제 상세 기사 웹 페이지 주소(Deep Link) 또는 포털 기사 검색 상세 URL을 명확하게 기재할 것.
3. 마크다운 백틱 없이 순수 JSON 배열([])만 반환할 것.

출력 JSON 규격:
[
  {
    "id": "card-1",
    "category": "수주 / 입찰 / FEED 중 택1",
    "client": "사우디 Aramco",
    "title": "국문 요약 제목",
    "titleEn": "영문 원문 기사 제목",
    "summary": [
      "프로젝트 진행 현황 및 패키지 주요 내역",
      "발주처 협의 및 입찰 평가 진행 일정",
      "사업 수주 시 기대 파급 효과 및 계약 규모"
    ],
    "source": "언론사 및 전문지명 (예: MEED, Oil & Gas Middle East)",
    "publishedAt": "2026-09-22",
    "url": "https://www.oilandgasmiddleeast.com/news/해당상세기사경로"
  }
]
`;

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }]
      })
    });

    const result = await response.json();
    if (result.error) {
      console.error('Gemini API 에러:', JSON.stringify(result.error, null, 2));
      process.exit(1);
    }

    let text = result.candidates[0].content.parts[0].text.trim();
    if (text.startsWith('```json')) text = text.replace(/^```json/, '').replace(/```$/, '').trim();
    else if (text.startsWith('```')) text = text.replace(/^```/, '').replace(/```$/, '').trim();

    const publicDir = path.join(__dirname, '../public');
    if (!fs.existsSync(publicDir)) {
      fs.mkdirSync(publicDir, { recursive: true });
    }

    fs.writeFileSync(path.join(publicDir, 'news.json'), text, 'utf-8');
    console.log('상세 기사 URL 매핑 news.json 업데이트 완료');
  } catch (error) {
    console.error('에러 발생:', error);
    process.exit(1);
  }
}

getNewsData();
