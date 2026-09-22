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

  const prompt = `삼성E&A(Samsung E&A, 구 삼성엔지니어링) 및 글로벌 EPC 플랜트 업계의 최근 수주, 입찰, FEED, 대형 계약 동향 브리핑 데이터를 작성해 줘.
핵심 모니터링 대상 국가 및 발주처: 사우디아라비아(Aramco, SABIC), UAE(ADNOC), 카타르(QE), 바레인(Bapco), 쿠웨이트(KOC/KNPC), 인도(ACME), 멕시코(Mexinol), 호주/인도네시아(INPEX).

반드시 아래 JSON 배열 규격만 순수 텍스트(마크다운 백틱 제외)로 응답할 것:
[
  {
    "id": "card-1",
    "category": "수주",
    "client": "사우디 Aramco",
    "title": "사우디 파딜리 가스 증산 패키지 공정 호조 및 추가 패키지 입찰 대응",
    "titleEn": "Fadhili Gas Increment Program EPC Progress & Additional Packages Tender",
    "summary": [
      "파딜리 가스 플랜트 증산 패키지 1·4번의 모듈러 공법 적용으로 안정적 공정률 및 원가 경쟁력 확보",
      "사우디 아람코가 발주 예정인 자푸라(Jafurah) 비전통 가스 2단계 연계 사업 입찰 모니터링 지속",
      "중동 가스 인프라 중심의 EPC 포트폴리오 강화로 견조한 수주 잔고 및 수익성 견인"
    ],
    "source": "MEED / 업계 종합",
    "publishedAt": "2026-09-22",
    "url": "https://www.samsungena.com"
  },
  {
    "id": "card-2",
    "category": "입찰",
    "client": "UAE ADNOC",
    "title": "루와이스 저탄소 석유화학 콤플렉스 및 가스 프로젝트 상업 입찰 평가",
    "titleEn": "ADNOC Ruwais Petrochemicals & Gas Expansion Commercial Bid Evaluation",
    "summary": [
      "ADNOC의 저탄소 LNG 및 하류부문 화학단지 패키지에 대한 글로벌 선도 EPC사들 간 기술/가격 제안서 평가 진행",
      "선제적 FEED 연계 수행 역량 및 현지화(ICV) 조건을 바탕으로 수주 우위 전략 구사",
      "연내 우선협상대상자 선정 및 본계약 체결을 앞두고 최종 기술 조율 중"
    ],
    "source": "E&P 전문지",
    "publishedAt": "2026-09-22",
    "url": "https://www.adnoc.ae"
  },
  {
    "id": "card-3",
    "category": "FEED",
    "client": "인도 ACME / 글로벌",
    "title": "그린 수소·암모니아 및 CCUS 연계 플랜트 기본설계(FEED) 확대",
    "titleEn": "Green Hydrogen & Ammonia FEED Pipeline Expansion for Energy Transition",
    "summary": [
      "오만 및 인도 등 신재생 기반 그린 암모니아 생산 시설에 대한 FEED-to-EPC 전환 가속화",
      "글로벌 오일 메이저들의 탄소 감축 의무화에 따른 CCUS 플랜트 선제적 표준화 설계 추진",
      "단순 시공 중심을 넘어 엔지니어링 선행 단계를 통한 고수익성 프로젝트 선점 효과 기대"
    ],
    "source": "플랜트 저널 종합",
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
    console.log('news.json 업데이트 완료');
  } catch (error) {
    console.error('에러 발생:', error);
    process.exit(1);
  }
}

getNewsData();
