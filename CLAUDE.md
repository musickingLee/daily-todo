# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 프로젝트 개요

일일 투두리스트 웹앱. 앱 실행 즉시 오늘 날짜가 표시되고, 바로 타이핑해서 할 일을 추가할 수 있음. 마찰 최소화가 핵심 가치.

## 실행 방법

```bash
npm run dev        # 개발 서버 (http://localhost:5173)
npm run build      # 프로덕션 빌드
```

또는 `start.command` 더블클릭 (macOS)

## 기술 스택

- Vite + React
- localStorage (데이터 저장)
- TipTap (실시간 마크다운 에디터)
- Chart.js (시간 통계 시각화)
- 순수 CSS (라이트/다크/시스템 테마)

## 구조

```
src/
├── App.jsx              # 메인 앱, 탭 전환 (Today/Goals/Archive)
├── components/
│   ├── TodoList.jsx     # 투두 입력/표시/체크/수정/타이머/드래그 순서변경
│   ├── Calendar.jsx     # 월별 캘린더, 과거 기록 조회
│   ├── Goals.jsx        # 연간/월간/주간 목표 관리
│   ├── GoalsArchive.jsx # 과거 목표 아카이브 조회
│   ├── MemoModal.jsx    # 전체 메모장 모달 (TipTap)
│   ├── TipTapEditor.jsx # 실시간 마크다운 에디터
│   ├── CategorySidebar.jsx  # 카테고리 관리 사이드바
│   ├── TimeStats.jsx    # 시간 통계 시각화 (우측 사이드바)
│   └── DayTimeline.jsx  # 24시간 타임라인 시각화
```

## 데이터 저장 방식

- `todos-YYYY-MM-DD`: 해당 날짜의 투두 배열
- `dates-with-data`: 기록이 있는 날짜 목록 (캘린더 표시용)
- `categories`: 카테고리 목록
- `theme`: 테마 설정 (light/dark/system)
- `goals-year-YYYY`: 연간 목표 배열
- `goals-month-YYYY-MM`: 월간 목표 배열
- `goals-week-YYYY-WNN`: 주간 목표 배열 (ISO 주차)
- `goals-archive`: 기간이 지난 목표들의 아카이브
- `goals-last-period-keys`: 마지막 기간 키 (앱 재시작 시 아카이브 처리용)
- `fixed-schedule`: 고정일정 텍스트

## 구현 완료

- [x] 오늘 날짜 자동 표시
- [x] 즉시 타이핑 → Enter로 항목 추가
- [x] 체크박스 클릭 시 취소선
- [x] 항목 삭제 기능
- [x] Archive 탭 - 캘린더 뷰
- [x] 월/년도 이동
- [x] 기록 있는 날짜만 클릭 가능 (없는 날짜는 흐리게)
- [x] 과거 기록 조회
- [x] localStorage 자동 저장
- [x] 다크모드 지원
- [x] 더블클릭 실행 스크립트 (start.command)
- [x] 자정(00:00) 자동 화면 리셋
- [x] 항목별 메모장 기능 (📝 버튼 클릭)
- [x] PWA 지원 (앱으로 설치 가능)
- [x] 카테고리 기능 (왼쪽 사이드바에서 관리, 색상 지정)
- [x] 3컬럼 레이아웃 (카테고리 사이드바 | 메인 투두 | 여백)
- [x] 반응형 디자인 (모바일에서 카테고리가 상단으로 이동)
- [x] Electron 패키징 (독립 데스크톱 앱)
- [x] 전체 메모장 모달 (📄 버튼) - 마크다운 지원
- [x] TipTap 실시간 마크다운 에디터 (간단 메모 + 전체 메모장)
- [x] 할 일 텍스트 수정 기능 (더블클릭으로 편집)
- [x] 항목별 타이머 기능 (▶️/⏸️ 버튼으로 시작/정지)
- [x] 시간 통계 시각화 (우측 사이드바)
  - 일별/주별/월별 보기
  - 카테고리별 시간 사용량
  - Pie Chart / Bar Plot 선택
- [x] 24시간 타임라인 (세로 24칸)
  - 타이머 세션 기록 (시작/종료 시각 저장)
  - 카테고리 색상으로 시간대 표시
  - 현재 시각 표시 (빨간 선)
  - 실시간 업데이트
  - 마우스 호버 시 툴팁 표시 (좌측)
- [x] 자정 넘김 버그 수정 (setTimeout 타이밍 오차로 인한 중복 투두 방지)
- [x] Archive 읽기 전용 (체크박스 비활성화)
- [x] Archive 날짜 선택 시 해당 날짜 타임라인 연동
- [x] Today 탭 전환 시 스크롤 상단 리셋
- [x] 입력 칸 하단 고정 (sticky)
- [x] 3컬럼 레이아웃 개선 (전체화면에서 사이드바 배경 끝까지 확장)
- [x] 테마 전환 기능 (☀️ 라이트 / 🌙 다크 / 💻 시스템)
- [x] Archive 통계 기능 (월별/연별 통계, 캘린더 월 이동 시 자동 업데이트)
- [x] 차트 시간 레이블 개선 (짧은 형식 1h30m + 45도 회전)
- [x] 드래그 앤 드롭으로 할 일 순서 변경
- [x] 할 일 입력 시 카테고리 미리 지정 (입력창 왼쪽 버튼)
- [x] Goals 탭 (Today와 Archive 사이)
  - 이번 해 / 이번 달 / 이번 주 목표 관리
  - 체크박스로 완료 표시
  - 더블클릭으로 목표 수정
  - 주/월/년 전환 시 자동 아카이브
  - 주차 날짜 범위 표시 (예: 1주차 목표 (12/30 ~ 1/5))
- [x] 과거 목표 기록 조회 (Archive에서 버튼 클릭)
  - 연간/월간/주간 필터링
  - 완료 통계 표시
- [x] 고정일정 섹션 (좌측 사이드바 하단)
  - 날짜와 무관하게 유지되는 메모 영역
- [x] Electron 기본 창 크기 1200x900 (사이드바 전체 표시)
