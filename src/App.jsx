import React, { useState, useEffect } from 'react';

export default function App() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 매일 자동 업데이트되는 뉴스 데이터 불러오기
    fetch('/news-data.json')
      .then((res) => res.json())
      .then((json) => {
        setData(json);
        setLoading(false);
      })
      .catch((err) => {
        console.error('데이터 로드 실패:', err);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', fontFamily: 'sans-serif' }}>
        <p>📱 아침 뉴스 브리핑 불러오는 중...</p>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '480px', margin: '0 auto', padding: '16px', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif', backgroundColor: '#f8fafc', minHeight: '100vh' }}>
      <header style={{ marginBottom: '20px', paddingBottom: '12px', borderBottom: '2px solid #2563eb' }}>
        <h1 style={{ fontSize: '20px', margin: '0 0 4px 0', color: '#0f172a' }}>📰 일일 아침 뉴스 브리핑</h1>
        <p style={{ fontSize: '12px', color: '#64748b', margin: 0 }}>업데이트: {data?.updatedAt || '최근 24시간 내'}</p>
      </header>

      {/* 카테고리별 뉴스 섹션 */}
      <Section title="1. 주요 기업 동향" items={data?.companyNews} />
      <Section title="2. 그룹 및 해외 언론 뉴스" items={data?.groupNews} />
      <Section title="3. 입찰 관련 주요 뉴스" items={data?.biddingNews} />
      <Section title="4. 글로벌 석유 메이저 (Aramco, ADNOC 등)" items={data?.energyMajorsNews} />
    </div>
  );
}

function Section({ title, items }) {
  return (
    <div style={{ backgroundColor: '#ffffff', borderRadius: '12px', padding: '16px', marginBottom: '16px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
      <h2 style={{ fontSize: '15px', color: '#1e40af', marginTop: 0, marginBottom: '12px', borderBottom: '1px solid #f1f5f9', paddingBottom: '6px' }}>
        {title}
      </h2>
      {items && items.length > 0 ? (
        items.map((item, index) => (
          <div key={index} style={{ marginBottom: '12px', paddingBottom: index < items.length - 1 ? '12px' : '0', borderBottom: index < items.length - 1 ? '1px solid #f1f5f9' : 'none' }}>
            <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#334155', marginBottom: '4px' }}>
              • {item.title}
            </div>
            <p style={{ fontSize: '12px', color: '#475569', margin: '4px 0 6px 0', lineHeight: '1.4' }}>
              {item.summary}
            </p>
            <div style={{ fontSize: '10px', color: '#94a3b8' }}>
              {item.source} | {item.date}
            </div>
          </div>
        ))
      ) : (
        <p style={{ fontSize: '12px', color: '#94a3b8', margin: 0 }}>최근 24시간 내 관련 기사가 없습니다.</p>
      )}
    </div>
  );
}
