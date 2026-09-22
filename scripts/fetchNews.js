import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function getNewsData() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error('에러: GEMINI_API_KEY 환경변수가 설정되지 않았습니다.');
    process.exit(1);
  }

  const now = new Date();
  const kstOffset = 9 * 60;
  const kstTime = new Date(now.getTime() + (now.getTimezoneOffset() + kstOffset) * 60000);
  const todayStr = kstTime.toISOString().split('T')[0];

  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent?key=${apiKey}`;

  const prompt = `삼성E&A(Samsung E&A, 구 삼성엔지니어링) 및 글로벌 플랜트 EPC 업계의 최근 수주, 입찰, FEED, 대형 계약 관련 실제 주요 뉴스를 바탕으로 모바일 카드뉴스 데이터를 JSON으로 작성해 줘.
핵심 모니터링 대상: 사우디 Aramco/SABIC, UAE ADNOC, 카타르 QE, 바레인 Bapco, 쿠웨이트 KOC/KNPC, 인도 ACME, 멕시코 Mexinol, 호주/인니 INPEX.

[필수 요구사항]:
1. 발행일시(publishedAt)는 반드시 "${todayStr}"로 기재할 것.
2. 마크다운 백틱 없이 순수 JSON 배열([])만 출력할 것.

JSON 형식:
[
  {
    "id": "card-1",
    "category": "수주 / 입찰 / FEED 중 택1",
    "client": "발주처 (예: 사우디 Aramco, UAE ADNOC 등)",
    "title": "실제 포털/언론사에서 검색 가능한 정확한 국문 요약 제목",
    "titleEn": "영문 원문 기사 제목",
    "summary": [
      "프로젝트 진행 현황 및 패키지 주요 내역",
      "발주처 협의 및 입찰 평가 진행 일정",
      "사업 수주 시 기대 파급 효과 및 계약 규모"
    ],
    "source": "언론사명 (예: 연합뉴스, MEED, Oil & Gas Middle East)",
    "publishedAt": "${todayStr}"
  }
]
`;

  let attempts = 0;
  const maxAttempts = 3;

  while (attempts < maxAttempts) {
    attempts++;
    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
      });

      const result = await response.json();
      if (result.error) {
        if (result.error.code === 503 && attempts < maxAttempts) {
          await sleep(5000);
          continue;
        }
        process.exit(1);
      }

      let text = result.candidates[0].content.parts[0].text.trim();
      if (text.startsWith('```json')) text = text.replace(/^```json/, '').replace(/```$/, '').trim();
      else if (text.startsWith('```')) text = text.replace(/^```/, '').replace(/```$/, '').trim();

      const parsed = JSON.parse(text);
      if (Array.isArray(parsed)) {
        parsed.forEach(item => {
          item.publishedAt = todayStr;
          // 가짜 깨진 링크 대신, 정확한 기사 원문으로 바로 이어지는 구글 뉴스 다이렉트 검색 링크 생성
          const query = encodeURIComponent(`${item.source || ''} ${item.title}`);
          item.url = `https://www.google.com/search?tbm=nws&q=${query}`;
        });
        text = JSON.stringify(parsed, null, 2);
      }

      const publicDir = path.join(__dirname, '../public');
      if (!fs.existsSync(publicDir)) {
        fs.mkdirSync(publicDir, { recursive: true });
      }

      fs.writeFileSync(path.join(publicDir, 'news.json'), text, 'utf-8');
      console.log('실제 기사 직행 링크 생성 완료');
      return;
    } catch (err) {
      if (attempts < maxAttempts) {
        await sleep(5000);
        continue;
      }
      process.exit(1);
    }
  }
}

getNewsData();
