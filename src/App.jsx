import React, { useState, useEffect } from 'react';

const defaultNews = [
  {
    id: 1,
    category: "1. 주요 기업 동향",
    headline: "삼성E&A, 친환경·에너지 전환(E&T) 중심 미래 성장 동력 가속화",
    summary: "사우디 파딜리(Fadhili) 가스 증산 등 대형 프로젝트의 순항과 함께 수소, 탄소포집(CCUS) 및 지속가능 항공유(SAF) 분야 글로벌 파트너십을 공격적으로 확대 중.",
    source: "삼성E&A IR / 업계 종합",
    publishedAt: "2026-09-22",
    link: "https://www.samsungena.com"
  },
  {
    id: 2,
    category: "2. 그룹 및 해외 언론 뉴스",
    headline: "글로벌 플랜트 엔지니어링 시장 내 K-EPC 기술 경쟁력 집중 조명",
    summary: "중동 발주처들의 모듈화 공법 및 디지털 EPC 적용 요구가 강화되는 가운데, 삼성E&A의 FEED-to-EPC 연계 수행 역량과 프로젝트 납기 준수 신뢰도가 높게 평가됨.",
    source: "해외 플랜트 저널",
    publishedAt: "2026-09-22",
    link: "https://www.samsungena.com"
  },
  {
    id: 3,
    category: "3. 입찰 관련 주요 뉴스",
    headline: "중동 및 동남아 대형 가스·정유 패키지 입찰 파이프라인 본격화",
    summary: "사우디, UAE, 카타르 및 인도네시아 등 주요 지역 대형 가스 처리 및 다운스트림 패키지의 상업 입찰 평가가 진행 중이며 연내 우선협상대상자 선정 기대.",
    source: "입찰 정보 모니터링",
    publishedAt: "2026-09-22",
    link: "https://www.samsungena.com"
  },
  {
    id: 4,
    category: "4. 글로벌 석유 메이저 (Aramco, ADNOC 등)",
    headline: "사우디 아람코·UAE 아드녹, 대규모 가스 증산 및 저탄소 프로젝트 발주 확대",
    summary: "아람코의 비전통 가스 개발 및 아드녹의 친환경 석유화학 콤플렉스 투자 계획이 가시화되며 글로벌 탑티어 EPC 기업 대상 패키지 발주가 연쇄적으로 이어질 전망.",
    source: "MEED / Energy Focus",
    publishedAt: "2026-09-22",
    link: "https://www.aramco.com"
  }
];

export default function App() {
  const [newsList, setNewsList] = useState(defaultNews);
  const [updatedTime, setUpdatedTime] = useState("최근 24시간 기준");

  useEffect(() => {
    // news.json이 있으면 동적으로 읽어오고, 없거나 비어있으면 기본 브리핑을 유지
    fetch('/news.json?t=' + new Date().getTime())
      .then(res => res.json())
      .then(data => {
        if (data && data.length > 0) {
          setNewsList(data);
          setUpdatedTime("자동 갱신 완료");
        } else if (data && data.sections) {
          const flat = data.sections.map((s, idx) => ({
            id: s.id || idx + 1,
            category: `${idx + 1}. ${s.title}`,
            headline: s.items[0]?.headline || s.title,
            summary: s.items[0]?.summary || "",
            source: s.items[0]?.source || "업계 종합",
            publishedAt: data.updatedAt || "2026-09-22",
            link: s.items[0]?.url || "https://www.samsungena.com"
          }));
          setNewsList(flat);
          setUpdatedTime(data.updatedAt || "자동 갱신 완료");
        }
      })
      .catch(() => {
        // 캐시/네트워크 문제 발생 시 기본 브리핑 표시
      });
  }, []);

  return (
    <div style={{ maxWidth: '480px', margin: '0 auto', padding: '20px 16px', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif', backgroundColor: '#f8fafc', minHeight: '100vh' }}>
      <header style={{ borderBottom: '2px solid #2563eb', paddingBottom: '12px', marginBottom: '20px' }}>
        <h1 style={{ fontSize: '20px', fontWeight: '800', color: '#0f172a', margin: '0 0 6px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
          📰 일일 아침 뉴스 브리핑
        </h1>
        <p style={{ fontSize: '12px', color: '#64748b', margin: 0 }}>
          업데이트: {updatedTime}
        </p>
      </header>

      <main style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {newsList.map((item) => (
          <div key={item.id} style={{ backgroundColor: '#ffffff', borderRadius: '14px', padding: '18px 16px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', border: '1px solid #e2e8f0' }}>
            <h2 style={{ fontSize: '15px', fontWeight: '700', color: '#1d4ed8', margin: '0 0 10px 0' }}>
              {item.category}
            </h2>
            <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#1e293b', margin: '0 0 8px 0', lineHeight: '1.4' }}>
              {item.headline || item.title}
            </h3>
            <p style={{ fontSize: '14px', color: '#475569', margin: '0 0 12px 0', lineHeight: '1.5' }}>
              {Array.isArray(item.summary) ? item.summary.join(' ') : item.summary}
            </p>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '11px', color: '#94a3b8', borderTop: '1px solid #f1f5f9', paddingTop: '10px' }}>
              <span>출처: {item.source}</span>
              {item.link && (
                <a href={item.link} target="_blank" rel="noreferrer" style={{ color: '#2563eb', textDecoration: 'none', fontWeight: '600' }}>
                  원문 보기 →
                </a>
              )}
            </div>
          </div>
        ))}
      </main>
    </div>
  );
}
