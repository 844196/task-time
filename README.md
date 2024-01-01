# man-hour [![CI](https://github.com/844196/man-hour/actions/workflows/ci.yml/badge.svg)](https://github.com/844196/man-hour/actions/workflows/ci.yml) [![npm (scoped)](https://img.shields.io/npm/v/%40efumaxay/man-hour)](https://www.npmjs.com/package/@efumaxay/man-hour)

## Usage

### Simple

```console
$ npx @efumaxay/man-hour '2023-11-30T15:23:33+09:00' '2023-12-04T11:34:29+09:00' \
  --work-start='10:00+09:00' \
  --work-end='19:00+09:00' \
  --work-period='05:00+09:00' \
  --break-start='13:00+09:00' \
  --break-end='14:00+09:00'
13.3
```

### Advanced

```console
$ npx @efumaxay/man-hour '2023-11-30T15:23:33+09:00' '2023-12-04T11:34:29+09:00' \
    --step=0.5 \
    --work-start='10:00+09:00' \
    --work-end='19:00+09:00' \
    --work-period='05:00+09:00' \
    --break-start='13:00+09:00' \
    --break-end='14:00+09:00' \
    --reporter=json \
    --locale=ja-JP \
    --timezone=Asia/Tokyo
[
  {
    "interval": "2023/11/30木曜日 15:23:33～19:00:00",
    "hours": 4,
    "isoInterval": "2023-11-30T06:23:33Z/2023-11-30T10:00:00Z",
    "isoDuration": "P0Y0M0DT3H36M27S"
  },
  {
    "interval": "2023/12/1金曜日 10:00:00～13:00:00",
    "hours": 3,
    "isoInterval": "2023-12-01T01:00:00Z/2023-12-01T04:00:00Z",
    "isoDuration": "P0Y0M0DT3H0M0S"
  },
  {
    "interval": "2023/12/1金曜日 14:00:00～19:00:00",
    "hours": 5,
    "isoInterval": "2023-12-01T05:00:00Z/2023-12-01T10:00:00Z",
    "isoDuration": "P0Y0M0DT5H0M0S"
  },
  {
    "interval": "2023/12/4月曜日 10:00:00～11:34:29",
    "hours": 2,
    "isoInterval": "2023-12-04T01:00:00Z/2023-12-04T02:34:29Z",
    "isoDuration": "P0Y0M0DT1H34M29S"
  }
]
```
