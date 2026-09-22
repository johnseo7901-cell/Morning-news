import React, { useState, useEffect } from 'react';

export default function App() {
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/news.json?v=' + Date.now())
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setCards(data);
        } else if (data && data.sections) {
          // 혹시 모를 이전 포맷 대비
          const converted = data.sections.map((sec, idx) => ({
            id: `card-${idx + 1}`,
            category: "동향",
            client: "글로벌 발주처",
            title: sec.items[0]?.headline || sec.title,
            titleEn: "Global Plant Market Briefing",
            summary: [sec.items[0]?.summary || ""],
            source: sec.items[0]?.source || "종합",
            publishedAt: data.updatedAt || "오늘",
            url: sec.items[0]?.url || "https://www.samsungena.com"
          }));
          setCards(converted);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  return (
    <div style={{ maxWidth: '520px', margin: '0 auto', padding: '16px', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif', backgroundColor: '#f1f5f9', minHeight: '100vh' }}>
      
      {/* 상단 헤더 */}
      <header style={{ backgroundColor: '#ffffff', borderRadius: '16px', padding: '16px 20px', marginBottom: '16px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', borderBottom: '3px solid #002f6c' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h1 style={{ fontSize: '18px', fontWeight: '800', color: '#002f6c', margin: 0, display: 'flex', alignItems: 'center', gap: '6px' }}>
            📋 삼성E&A 글로벌 수주·입찰 브리핑
          </h1>
        </div>
        <div style={{ fontSize: '12px', color: '#64748b', marginTop: '6px', display: 'flex', gap: '8px' }}>
          <span>모니터링: 사우디, UAE, 카타르, 바레인, 쿠웨이트 등</span>
        </div>
      </header>

      {/* 카드뉴스 본문 */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px 0', color: '#64748b', fontSize: '14px' }}>
          브리핑 데이터를 불러오는 중입니다...
        </div>
      ) : cards.length === 0 ? (
        <div style={{ backgroundColor: '#ffffff', borderRadius: '14px', padding: '30px', textAlign: 'center', color: '#64748b' }}>
          금일 신규 수주·입찰 공시 및 기사가 없습니다.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {cards.map((card) => (
            <article key={card.id} style={{ backgroundColor: '#ffffff', borderRadius: '16px', padding: '18px', boxShadow: '0 2px 6px rgba(0,0,0,0.04)', border: '1px solid #e2e8f0' }}>
              
              {/* 카테고리 태그 및 발주처 */}
              <div style={{ display: 'flex', gap: '6px', alignItems: 'center', marginBottom: '10px' }}>
                <span style={{ 
                  backgroundColor: card.category === '수주' ? '#e0f2fe' : card.category === '입찰' ? '#fef3c7' : '#f3e8ff',
                  color: card.category === '수주' ? '#0284c7' : card.category === '입찰' ? '#d97706' : '#7c3aed',
                  fontSize: '11px', fontWeight: '700', padding: '3px 8px', borderRadius: '6px' 
                }}>
                  {card.category}
                </span>
                <span style={{ backgroundColor: '#f8fafc', border: '1px solid #cbd5e1', color: '#334155', fontSize: '11px', fontWeight: '600', padding: '3px 8px', borderRadius: '6px' }}>
                  {card.client}
                </span>
                <span style={{ fontSize: '11px', color: '#94a3b8', marginLeft: 'auto' }}>
                  {card.publishedAt}
                </span>
              </div>

              {/* 국문 제목 */}
              <h2 style={{ fontSize: '16px', fontWeight: '700', color: '#0f172a', margin: '0 0 4px 0', lineHeight: '1.4' }}>
                {card.title}
              </h2>

              {/* 영문 원문 제목 */}
              {card.titleEn && (
                <p style={{ fontSize: '12px', color: '#64748b', margin: '0 0 12px 0', fontStyle: 'italic', lineHeight: '1.3' }}>
                  {card.titleEn}
                </p>
              )}

              {/* 3줄 불릿 요약 */}
              <div style={{ backgroundColor: '#f8fafc', borderRadius: '10px', padding: '12px', marginBottom: '12px' }}>
                <ul style={{ margin: 0, paddingLeft: '18px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {Array.isArray(card.summary) ? (
                    card.summary.map((point, pIdx) => (
                      <li key={pIdx} style={{ fontSize: '13px', color: '#334155', lineHeight: '1.45' }}>
                        {point}
                      </li>
                    ))
                  ) : (
                    <li style={{ fontSize: '13px', color: '#334155', lineHeight: '1.45' }}>{card.summary}</li>
                  )}
                </ul>
              </div>

              {/* 하단 출처 및 링크 */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '11px', color: '#94a3b8' }}>
                <span>출처: {card.source}</span>
                {card.url && (
                  <a href={card.url} target="_blank" rel="noreferrer" style={{ color: '#0284c7', textDecoration: 'none', fontWeight: '600' }}>
                    상세 원문 →
                  </a>
                )}
              </div>

            </article>
          ))}
        </div>
      )}

      <footer style={{ textAlign: 'center', fontSize: '11px', color: '#94a3b8', marginTop: '24px', paddingBottom: '16px' }}>
        삼성E&A EPC Bidding Intelligence Briefing
      </footer>
    </div>
  );
}
