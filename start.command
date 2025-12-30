#!/bin/bash

cd "$(dirname "$0")"

# 브라우저 열기 (2초 후)
(sleep 2 && open http://localhost:5173) &

# 서버 시작
npm run dev
