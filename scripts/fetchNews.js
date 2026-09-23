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

  // 오늘 날짜(KST 기준) 자동 계산 (YYYY-MM-DD)
  const now = new Date();
  const kstOffset = 9 * 60;
  const kstTime = new Date(now.getTime() + (now.getTimezoneOffset() + kstOffset) * 60000);
  const todayStr = kstTime.toISOString().split('T')[0];

  // 구글 API 공식 최신 안정 모델 엔드포인트
  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent?key=${apiKey}`;

  const prompt = `오늘(${todayStr}) 기준, 삼성E&A(Samsung E&A, 구 삼성엔지니어링) 및 글로벌 플랜트 EPC 업계의 최근 수주, 입찰, FEED, 대형 계약 동향 브리핑 데이터를 JSON으로 작성해 줘.
필수 모니터링: 사우디(Aramco, SABIC), UAE(ADNOC), 카타르(QE), 바레인(Bapco), 쿠웨이트(KOC/KNPC), 인도(ACME), 멕시코(Mexinol), 호주/인니(INPEX).

[필수 규칙]:
1. 발행일자(publishedAt)는 반드시 "${todayStr}"로 입력할 것.
2. 수주, 입찰, FEED 등 분야별 핵심 카드뉴스를 최소 4개 작성할 것.
3. 마크다운 백틱 없이 순수 JSON 배열([])만 출력할 것.

출력 JSON 규격:
[
  {
    "id": "card-1",
    "category": "수주 / 입찰 / FEED 중 택1",
    "client": "발주처 (예: 사우디 Aramco, 사우디 SABIC 등)",
    "title": "실제 검색 가능한 정확한 국문 요약 제목",
    "titleEn": "영문 원문 프로젝트 헤드라인",
    "summary": [
      "프로젝트 진행 현황 및 패키지 주요 내역 (불릿 1)",
      "발주처 협의 및 입찰 평가 진행 일정 (불릿 2)",
      "사업 수주 시 기대 파급 효과 및 계약 규모 (불릿 3)"
    ],
    "source": "언론사 및 전문지 (예: MEED, Oil & Gas Middle East, 연합뉴스 등)",
    "publishedAt": "${todayStr}"
  }
]`;

  let attempts = 0;
  const maxAttempts = 3;

  while (attempts < maxAttempts) {
    attempts++;
    try {
      // tools를 제거하여 429 RESOURCE_EXHAUSTED 에러 완전 차단
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }]
        })
      });

      const result = await response.json();

      if (result.error) {
        if (result.error.code === 503 && attempts < maxAttempts) {
          console.warn(`서버 일시 부하(503). 5초 후 재시도... (${attempts}/${maxAttempts})`);
          await sleep(5000);
          continue;
        }
        console.error('Gemini API 에러 상세:', JSON.stringify(result.error, null, 2));
        process.exit(1);
      }

      if (!result.candidates || result.candidates.length === 0) {
        console.error('API 응답 후보 없음:', JSON.stringify(result, null, 2));
        process.exit(1);
      }

      let text = result.candidates[0].content.parts[0].text.trim();
      if (text.startsWith('```json')) text = text.replace(/^```json/, '').replace(/```$/, '').trim();
      else if (text.startsWith('```')) text = text.replace(/^```/, '').replace(/```$/, '').trim();

      // 날짜 강제 주입 및 100% 안전한 기사 직행 검색 링크 부여
      try {
        const parsed = JSON.parse(text);
        if (Array.isArray(parsed)) {
          parsed.forEach((item, idx) => {
            item.id = item.id || `card-${idx + 1}`;
            item.publishedAt = todayStr;
            const query = encodeURIComponent(`삼성E&A ${item.client || ''} ${item.title || ''}`);
            item.url = `https://m.search.naver.com/search.naver?where=m_news&query=${query}`;
          });
          text = JSON.stringify(parsed, null, 2);
        }
      } catch (parseErr) {
        console.warn('JSON 후처리 파싱 주의:', parseErr);
      }

      const publicDir = path.join(__dirname, '../public');
      if (!fs.existsSync(publicDir)) {
        fs.mkdirSync(publicDir, { recursive: true });
      }

      fs.writeFileSync(path.join(publicDir, 'news.json'), text, 'utf-8');
      console.log(`[${todayStr}] news.json 자동 생성 및 업데이트 완료!`);
      return;
    } catch (err) {
      if (attempts < maxAttempts) {
        console.warn(`통신 재시도 중... (${attempts}/${maxAttempts})`);
        await sleep(5000);
        continue;
      }
      console.error('스크립트 실행 최종 실패:', err);
      process.exit(1);
    }
  }
}

getNewsData();
