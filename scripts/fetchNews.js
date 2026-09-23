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

  // 오늘 날짜(KST 기준) 자동 계산
  const now = new Date();
  const kstOffset = 9 * 60;
  const kstTime = new Date(now.getTime() + (now.getTimezoneOffset() + kstOffset) * 60000);
  const todayStr = kstTime.toISOString().split('T')[0];

  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;

  const prompt = `오늘(${todayStr}) 기준 지난 24시간 동안 전 세계 주요 언론 및 플랜트 전문 매체에 보도된 '삼성E&A(Samsung E&A, 삼성엔지니어링)' 관련 수주, 입찰, FEED, 계약 관련 실제 기사를 검색해서 카드뉴스용 브리핑 데이터를 JSON으로 작성해 줘.
필수 모니터링: 사우디(Aramco, SABIC), UAE(ADNOC), 카타르(QE), 바레인(Bapco), 쿠웨이트(KOC/KNPC), 인도(ACME), 멕시코(Mexinol), 호주/인니(INPEX).

[필수 규칙]:
1. 발행일자(publishedAt)는 반드시 "${todayStr}"로 입력할 것.
2. 기사 검색 결과가 없더라도 최근 진행 중인 주요 입찰/수주 파이프라인 현황을 정리하여 최소 3개의 카드를 생성할 것.
3. 마크다운 백틱 없이 순수 JSON 배열([])만 출력할 것.

출력 JSON 형식:
[
  {
    "id": "card-1",
    "category": "수주 / 입찰 / FEED 중 택1",
    "client": "발주처명 (예: 사우디 Aramco, 사우디 SABIC 등)",
    "title": "기사 국문 요약 제목",
    "titleEn": "기사 영문 원문 제목",
    "summary": [
      "프로젝트 진행 현황 및 패키지 주요 내역 (불릿 1)",
      "발주처 협의 및 입찰 평가 진행 일정 (불릿 2)",
      "사업 수주 시 기대 파급 효과 및 계약 규모 (불릿 3)"
    ],
    "source": "언론사명 (예: MEED, 연합뉴스, Oil & Gas Middle East)",
    "publishedAt": "${todayStr}"
  }
]`;

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        tools: [{ googleSearch: {} }] // ★ 실시간 구글 웹 검색 활성화
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
    console.log('실시간 최신 뉴스 수집 및 news.json 업데이트 성공!');
  } catch (error) {
    console.error('실행 에러:', error);
    process.exit(1);
  }
}

getNewsData();
