import type { SiteContent } from './types'

export const defaultContent: SiteContent = {
  home: {
    name: '이름을 입력하세요',
    tagline: '저는 무언가를 만들고 기록하는 사람입니다.',
    snapshot:
      '안녕하세요! 저는 ___입니다. 저는 ___에 관심이 많고, ___를 좋아합니다. 이 공간은 제가 해온 것들과 생각들을 기록하는 곳입니다.',
    keywords: ['기록', '디자인', '코딩', '탐구', '글쓰기'],
  },
  homeSections: [
    { id: 'hs-career', type: 'archive', name: '경력사항' },
    { id: 'hs-intern', type: 'archive', name: '인턴십' },
    { id: 'hs-edu',    type: 'archive', name: '학력사항' },
    { id: 'hs-act',    type: 'activity', name: '대외활동' },
    { id: 'hs-proj',   type: 'project',  name: '프로젝트' },
    { id: 'hs-award',  type: 'archive', name: '수상' },
    { id: 'hs-paper',  type: 'archive', name: '논문' },
    { id: 'hs-lang',   type: 'archive', name: '어학' },
    { id: 'hs-cert',   type: 'archive', name: '자격증' },
  ],
  archive: [
    { id: '1', category: '경력사항', title: '회사명', date: '2026.01 ~ 2026.03', desc: '담당 업무와 주요 성과를 입력하세요.' },
    { id: '2', category: '인턴십', title: '회사명', date: '2026.01 ~ 2026.03', desc: '인턴십 내용과 배운 점을 입력하세요.' },
    { id: '3', category: '학력사항', title: '학교명 / 전공', date: '2026.01 ~ 2026.03', desc: '학과 및 졸업 여부를 입력하세요.' },
    { id: '4', category: '수상', title: '수상명', date: '2026', desc: '수상 내용과 주최 기관을 입력하세요.' },
    { id: '5', category: '어학', title: '언어 / 시험명', date: '2026', desc: '점수 및 취득 기관을 입력하세요.' },
    { id: '6', category: '자격증', title: '자격증명', date: '2026', desc: '발급 기관을 입력하세요.' },
    { id: '7', category: '논문', title: '논문 제목', date: '2026', desc: '게재 학술지 및 주요 내용을 입력하세요.' },
  ],
  cards: [
    {
      id: 'a1',
      type: 'activity',
      title: '대외활동 이름',
      date: '2026',
      desc: '활동 내용과 역할을 입력하세요.',
      infoCards: [
        { id: 'org', icon: '🏢', label: '기관/단체', value: '' },
        { id: 'role', icon: '💼', label: '역할', value: '' },
        { id: 'act', icon: '📋', label: '주요 활동', value: '' },
      ],
    },
    {
      id: 'p1',
      type: 'project',
      title: '프로젝트 이름',
      date: '2026.01 ~ 2026.03',
      desc: '프로젝트 개요와 주요 기능을 입력하세요.',
      infoCards: [
        { id: 'team', icon: '👥', label: '팀 규모', value: '' },
        { id: 'role', icon: '💼', label: '역할', value: '' },
        { id: 'svc', icon: '⚙️', label: '담당 서비스', value: '' },
      ],
    },
  ],
  contact: [
    { id: 'email', type: 'email', value: 'your@email.com' },
  ],
}
