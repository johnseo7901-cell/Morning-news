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

  const prompt = `삼성E&A(Samsung E&A, 삼성엔지니어링) 및 글로벌 EPC 플랜트 업계의 최근 주요 소식을 바탕으로 모바일 아침 뉴스 브리핑 데이터를 JSON 형태로 작성해 줘.

반드시 아래 JSON 포맷을 정확히 지켜서, 마크다운 백틱 없이 순수 JSON만 출력할 것:
{
  "updatedAt": "오늘 날짜 및 시간(예: 2026. 9. 22 기준)",
  "sections": [
    {
      "id": 1,
      "title": "주요 기업 동향",
      "items": [
        {
          "headline": "삼성E&A 글로벌 수주 및 실적 핵심 동향",
          "summary": "핵심 사업 추진 현황, 친환경 에너지 전환 프로젝트 진행 상황 및 사업 경쟁력 요약.",
          "source": "국내외 경제지 종합",
          "url": "https://www.samsungena.com"
        }
      ]
    },
    {
      "id": 2,
      "title": "그룹 및 해외 언론 뉴스",
      "items": [
        {
          "headline": "글로벌 플랜트 엔지니어링 시장 전망 및 평가",
          "summary": "중동 및 아시아 태평양 지역 내 EPC 프로젝트 동향과 해외 주요 언론의 평가 분석.",
          "source": "해외 엔지니어링 저널",
          "url": "https://www.samsungena.com"
        }
      ]
    },
    {
      "id": 3,
      "title": "입찰 관련 주요 뉴스",
      "items": [
        {
          "headline": "중동·동남아 주요 패키지 입찰 및 FEED 수주 동향",
          "summary": "사우디, UAE, 카타르, 인도네시아 등 주요 가스/정유 플랜트 패키지 입찰 및 우선협상 관련 진행 사항.",
          "source": "플랜트 입찰 소식통",
          "url": "https://www.samsungena.com"
        }
      ]
    },
    {
      "id": 4,
      "title": "글로벌 석유 메이저 (Aramco, ADNOC 등)",
      "items": [
        {
          "headline": "아람코(Aramco) 및 아드녹(ADNOC) 초대형 투자 및 발주 계획",
          "summary": "사우디 아람코의 가스 증산 프로젝트 및 UAE 아드녹의 저탄소 플랜트 발주 파이프라인 동향 점검.",
          "source": "MEED / 오일가스 전문지",
          "url": "https://www.aramco.com"
        }
      ]
    }
  ],
  "items": [
    {
      "title": "삼성E&A 글로벌 수주 및 입찰 핵심 동향",
      "summary": "사우디 아람코, UAE 아드녹 등 중동 메이저 발주처 대상 주요 EPC/FEED 프로젝트 입찰 진행 현황 및 수주 파이프라인 분석.",
      "category": "수주/입찰",
      "client": "Aramco / ADNOC",
      "source": "EPC 종합",
      "url": "https://www.samsungena.com"
    }
  ]
}
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

    const outputPath = path.join(publicDir, 'news.json');
    fs.writeFileSync(outputPath, text, 'utf-8');
    console.log('news.json 업데이트 완료!');
  } catch (error) {
    console.error('실행 에러:', error);
    process.exit(1);
  }
}

getNewsData();
