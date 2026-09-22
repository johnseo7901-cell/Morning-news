import React, { useState, useEffect } from 'react';

export default function App() {
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/news.json?t=' + Date.now())
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setCards(data);
        } else if (data && Array.isArray(data.items)) {
          setCards(data.items);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error("데이터 로드 실패:", err);
        setLoading(false);
      });
  }, []);

  // 기사 원문으로 바로 이동하는 안전 검색 핸들러
  const handleOpenLink = (card) => {
    // 1. 유효한 직접 링크가 있으면 해당 링크로 이동
    if (card.url && card.url.startsWith('http') && !card.url.includes('samsungena.com')) {
      window.location.href = card.url;
      return;
    }
    // 2. 검색어가 필요한 경우 다음/구글 모바일 뉴스로 즉시 직행
    const query = encodeURIComponent(`삼성E&A ${card.client || ''} ${card.title || ''}`);
    window.location.href = `https://m.search.daum.net/search?w=news&q=${query}`;
  };

  return (
    <div style={{ maxWidth: '500px', margin: '0 auto', padding: '16px', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif', backgroundColor: '#f1f5f9', minHeight: '100vh' }}>
      
      {/* 상단 헤더 */}
      <header style={{ backgroundColor: '#ffffff', borderRadius: '16px', padding: '18px 20px', marginBottom: '16px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', borderBottom: '3px solid #002f6c' }}>
        <h1 style={{ fontSize: '18px', fontWeight: '800', color: '#002f6c', margin: '0 0 6px 0', display: 'flex', alignItems: 'center', gap: '6px' }}>
          📋 삼성E&A 글로벌 수주·입찰 브리핑
        </h1>
        <p style={{ fontSize: '12px', color: '#64748b', margin: 0 }}>
          모니터링: 사우디 Aramco, UAE ADNOC, 카타르, 바레인, 쿠웨이트 등
        </p>
      </header>

      {/* 카드 리스트 */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px 0', color: '#64748b', fontSize: '14px' }}>
          최신 브리핑을 불러오는 중입니다...
        </div>
      ) : cards.length === 0 ? (
        <div style={{ backgroundColor: '#ffffff', borderRadius: '14px', padding: '30px', textAlign: 'center', color: '#64748b' }}>
          금일 업데이트된 브리핑 기사가 없습니다.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {cards.map((card, idx) => (
            <article key={card.id || idx} style={{ backgroundColor: '#ffffff', borderRadius: '16px', padding: '18px', boxShadow: '0 2px 6px rgba(0,0,0,0.04)', border: '1px solid #e2e8f0' }}>
              
              {/* 카테고리 태그 및 발주처 */}
              <div style={{ display: 'flex', gap: '6px', alignItems: 'center', marginBottom: '10px' }}>
                <span style={{ 
                  backgroundColor: card.category?.includes('수주') ? '#e0f2fe' : card.category?.includes('입찰') ? '#fef3c7' : '#f3e8ff',
                  color: card.category?.includes('수주') ? '#0284c7' : card.category?.includes('입찰') ? '#d97706' : '#7c3aed',
                  fontSize: '11px', fontWeight: '700', padding: '3px 8px', borderRadius: '6px' 
                }}>
                  {card.category || '수주'}
                </span>
                <span style={{ backgroundColor: '#f8fafc', border: '1px solid #cbd5e1', color: '#334155', fontSize: '11px', fontWeight: '600', padding: '3px 8px', borderRadius: '6px' }}>
                  {card.client || '글로벌 발주처'}
                </span>
                <span style={{ fontSize: '11px', color: '#94a3b8', marginLeft: 'auto' }}>
                  {card.publishedAt}
                </span>
              </div>

              {/* 국문 요약 제목 */}
              <h2 style={{ fontSize: '15px', fontWeight: '700', color: '#0f172a', margin: '0 0 4px 0', lineHeight: '1.4' }}>
                {card.title}
              </h2>

              {/* 영문 원문 제목 */}
              {card.titleEn && (
                <p style={{ fontSize: '12px', color: '#64748b', margin: '0 0 12px 0', fontStyle: 'italic', lineHeight: '1.3' }}>
                  {card.titleEn}
                </p>
              )}

              {/* 3줄 핵심 요약 불릿 */}
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

              {/* 하단 출처 및 원문 링크 버튼 */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '11px', color: '#94a3b8', borderTop: '1px solid #f1f5f9', paddingTop: '10px' }}>
                <span>출처: {card.source || '전문지 종합'}</span>
                <button
                  onClick={() => handleOpenLink(card)}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#0284c7',
                    fontWeight: '700',
                    fontSize: '12px',
                    cursor: 'pointer',
                    padding: '4px 0'
                  }}
                >
                  기사 원문 보기 →
                </button>
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
