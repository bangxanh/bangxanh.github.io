#!/bin/sh
# Kiểm tra định dạng toàn bộ noi-dung/bai mà KHÔNG ghi vào site/ (an toàn khi nhiều người cùng soạn).
cd "$(dirname "$0")/.." || exit 1
T=$(mktemp -d)
mkdir -p "$T/data"
cp site/data/content.js site/data/version.json "$T/data/"
node scripts/build-lessons.js noi-dung/bai "$T"; R=$?
rm -rf "$T"
exit $R
