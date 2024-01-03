# man-hour [![npm (scoped)](https://img.shields.io/npm/v/%40efumaxay/man-hour)](https://www.npmjs.com/package/@efumaxay/man-hour)

## :package: Installation

```sh
npm i -g @efumaxay/man-hour
```

## :ok_hand: Usage

```console
$ man-hour '2023-11-30T15:23:33+09:00' '2023-12-04T11:34:29+09:00' \
    --work-start='10:00+09:00' \
    --work-end='19:00+09:00' \
    --work-period='05:00+09:00' \
    --break-start='13:00+09:00' \
    --break-end='14:00+09:00' \
    --timezone='Asia/Tokyo' \
    --locale='ja-JP'
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

You can also set options in saved configuration files (`${PWD}/.manhourrc.{json,yml,yaml}`).

```json
{
  "$schema": "https://raw.githubusercontent.com/844196/man-hour/v0.5.0/json-schema/manhourrc.json",
  "step": 0.5,
  "workStart": "10:00+09:00",
  "workEnd": "19:00+09:00",
  "workPeriod": "05:00+09:00",
  "breakStart": "13:00+09:00",
  "breakEnd": "14:00+09:00",
  "timezone": "Asia/Tokyo",
  "locale": "ja-JP"
}
```

## :bulb: Tips

### Sum

```console
$ man-hour --step 0.1 '2023-11-30T15:23:33+09:00' '2023-12-04T11:34:29+09:00' | jq '[.[].hours] | add * 10 | floor / 10'
13.3
```

### Markdown table (with [wfxr/csview](https://github.com/wfxr/csview))

```console
$ man-hour --step 0.1 '2023-11-30T15:23:33+09:00' '2023-12-04T11:34:29+09:00' \
    | jq -r '["Record", "Hours"], (.[] | [.interval, .hours]) | @csv' \
    | csview --style markdown
| Record                              | Hours |
| ----------------------------------- | ----- |
| 2023/11/30木曜日 15:23:33～19:00:00 | 3.7   |
| 2023/12/1金曜日 10:00:00～13:00:00  | 3     |
| 2023/12/1金曜日 14:00:00～19:00:00  | 5     |
| 2023/12/4月曜日 10:00:00～11:34:29  | 1.6   |
```
