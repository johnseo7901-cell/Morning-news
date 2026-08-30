const fs = require('fs');

async function generateNews() {
  const newsData = {
    updatedAt: new Date().toLocaleString('ko-KR', { timeZone: 'Asia/Seoul' }),
    companyNews: [
      { title: "주요 EPC 및 플랜트 관련 최신 동향", summary: "최근 해외 사업 수주 및 시장 전망 보고서 발표", source: "경제신문", date: "오늘" }
    ],
    groupNews: [],
    biddingNews: [],
    energyMajorsNews: [
      { title: "Aramco / ADNOC 신규 프로젝트 발주 계획", summary: "중동 지역 대형 중류/상류 플랜트 입찰 일정 업데이트", source: "Global Energy", date: "오늘" }
    ]
  };

  if (!fs.existsSync('./public')) {
    fs.mkdirSync('./public');
  }

  fs.writeFileSync('./public/news-data.json', JSON.stringify(newsData, null, 2));
  console.log("뉴스 데이터 업데이트 완료");
}

generateNews();
