import { type Interval } from 'date-fns'
import { describe, expect, it } from 'vitest'
import { type EachTaskTimeIntervalOptions, eachTaskTimeInterval } from './eachTaskTimeInterval.mjs'

type Scenario = {
  scenario: string
  start: Date
  end: Date
  expected: Interval[]
}

describe('eachTaskTimeInterval', () => {
  it.each([
    {
      scenario: '開始日時と終了日時が同じ',
      start: new Date('2024-01-01T11:00:00+09:00'),
      end: new Date('2024-01-01T11:00:00+09:00'),
      expected: [],
    },
    {
      scenario: '始業後に作業開始し、同日休憩開始前に作業終了',
      start: new Date('2024-01-01T11:00:00+09:00'),
      end: new Date('2024-01-01T12:30:00+09:00'),
      expected: [
        {
          start: new Date('2024-01-01T11:00:00+09:00'),
          end: new Date('2024-01-01T12:30:00+09:00'),
        },
      ],
    },
    {
      scenario: '始業後に作業開始し、同日休憩時間中に作業終了',
      start: new Date('2024-01-01T11:00:00+09:00'),
      end: new Date('2024-01-01T13:30:00+09:00'),
      expected: [
        {
          start: new Date('2024-01-01T11:00:00+09:00'),
          end: new Date('2024-01-01T13:30:00+09:00'),
        },
      ],
    },
    {
      scenario: '始業後に作業開始し、休憩時間を挟んで、同日終業時間までに作業終了',
      start: new Date('2024-01-01T11:00:00+09:00'),
      end: new Date('2024-01-01T16:00:00+09:00'),
      expected: [
        {
          start: new Date('2024-01-01T11:00:00+09:00'),
          end: new Date('2024-01-01T13:00:00+09:00'),
        },
        {
          start: new Date('2024-01-01T14:00:00+09:00'),
          end: new Date('2024-01-01T16:00:00+09:00'),
        },
      ],
    },
    {
      scenario: '始業後に作業開始し、休憩時間を挟んで、同日終業時間を超えて、同日までに作業終了',
      start: new Date('2024-01-01T11:00:00+09:00'),
      end: new Date('2024-01-01T20:00:00+09:00'),
      expected: [
        {
          start: new Date('2024-01-01T11:00:00+09:00'),
          end: new Date('2024-01-01T13:00:00+09:00'),
        },
        {
          start: new Date('2024-01-01T14:00:00+09:00'),
          end: new Date('2024-01-01T20:00:00+09:00'),
        },
      ],
    },
    {
      scenario: '始業後に作業開始し、休憩時間を挟んで、同日終業時間を超えて、翌日就業日境界までに作業終了',
      start: new Date('2024-01-01T11:00:00+09:00'),
      end: new Date('2024-01-02T03:00:00+09:00'),
      expected: [
        {
          start: new Date('2024-01-01T11:00:00+09:00'),
          end: new Date('2024-01-01T13:00:00+09:00'),
        },
        {
          start: new Date('2024-01-01T14:00:00+09:00'),
          end: new Date('2024-01-02T03:00:00+09:00'),
        },
      ],
    },
    {
      scenario:
        '始業後に作業開始し、休憩時間を挟んで、同日終業時間を超えて、翌日就業日境界を超えて、翌日始業前に作業終了',
      start: new Date('2024-01-01T11:00:00+09:00'),
      end: new Date('2024-01-02T08:00:00+09:00'),
      expected: [
        {
          start: new Date('2024-01-01T11:00:00+09:00'),
          end: new Date('2024-01-01T13:00:00+09:00'),
        },
        {
          start: new Date('2024-01-01T14:00:00+09:00'),
          end: new Date('2024-01-01T19:00:00+09:00'),
        },
        {
          start: new Date('2024-01-02T08:00:00+09:00'),
          end: new Date('2024-01-02T08:00:00+09:00'),
        },
      ],
    },
    {
      scenario:
        '始業後に作業開始し、休憩時間を挟んで、同日終業時間を超えて、翌日就業日境界を超えて、翌日始業後に作業終了',
      start: new Date('2024-01-01T11:00:00+09:00'),
      end: new Date('2024-01-02T12:00:00+09:00'),
      expected: [
        {
          start: new Date('2024-01-01T11:00:00+09:00'),
          end: new Date('2024-01-01T13:00:00+09:00'),
        },
        {
          start: new Date('2024-01-01T14:00:00+09:00'),
          end: new Date('2024-01-01T19:00:00+09:00'),
        },
        {
          start: new Date('2024-01-02T10:00:00+09:00'),
          end: new Date('2024-01-02T12:00:00+09:00'),
        },
      ],
    },
    {
      scenario: '火曜日に作業開始し、木曜日に作業終了',
      start: new Date('2024-01-02T11:00:00+09:00'),
      end: new Date('2024-01-04T16:00:00+09:00'),
      expected: [
        {
          start: new Date('2024-01-02T11:00:00+09:00'),
          end: new Date('2024-01-02T13:00:00+09:00'),
        },
        {
          start: new Date('2024-01-02T14:00:00+09:00'),
          end: new Date('2024-01-02T19:00:00+09:00'),
        },
        {
          start: new Date('2024-01-03T10:00:00+09:00'),
          end: new Date('2024-01-03T13:00:00+09:00'),
        },
        {
          start: new Date('2024-01-03T14:00:00+09:00'),
          end: new Date('2024-01-03T19:00:00+09:00'),
        },
        {
          start: new Date('2024-01-04T10:00:00+09:00'),
          end: new Date('2024-01-04T13:00:00+09:00'),
        },
        {
          start: new Date('2024-01-04T14:00:00+09:00'),
          end: new Date('2024-01-04T16:00:00+09:00'),
        },
      ],
    },
    {
      scenario: '木曜日に作業開始し、翌週火曜日に作業終了',
      start: new Date('2024-01-04T11:00:00+09:00'),
      end: new Date('2024-01-09T16:00:00+09:00'),
      expected: [
        {
          start: new Date('2024-01-04T11:00:00+09:00'),
          end: new Date('2024-01-04T13:00:00+09:00'),
        },
        {
          start: new Date('2024-01-04T14:00:00+09:00'),
          end: new Date('2024-01-04T19:00:00+09:00'),
        },
        {
          start: new Date('2024-01-05T10:00:00+09:00'),
          end: new Date('2024-01-05T13:00:00+09:00'),
        },
        {
          start: new Date('2024-01-05T14:00:00+09:00'),
          end: new Date('2024-01-05T19:00:00+09:00'),
        },
        {
          start: new Date('2024-01-08T10:00:00+09:00'),
          end: new Date('2024-01-08T13:00:00+09:00'),
        },
        {
          start: new Date('2024-01-08T14:00:00+09:00'),
          end: new Date('2024-01-08T19:00:00+09:00'),
        },
        {
          start: new Date('2024-01-09T10:00:00+09:00'),
          end: new Date('2024-01-09T13:00:00+09:00'),
        },
        {
          start: new Date('2024-01-09T14:00:00+09:00'),
          end: new Date('2024-01-09T16:00:00+09:00'),
        },
      ],
    },
    {
      scenario: '金曜日に作業開始し、同日終業時間を超えて、翌日就業日境界までに作業終了',
      start: new Date('2024-01-05T11:00:00+09:00'),
      end: new Date('2024-01-06T03:00:00+09:00'),
      expected: [
        {
          start: new Date('2024-01-05T11:00:00+09:00'),
          end: new Date('2024-01-05T13:00:00+09:00'),
        },
        {
          start: new Date('2024-01-05T14:00:00+09:00'),
          end: new Date('2024-01-06T03:00:00+09:00'),
        },
      ],
    },
    {
      scenario: '入力がUTC',
      start: new Date('2024-01-01T02:00:00Z'), // 11:00+09:00
      end: new Date('2024-01-01T09:30:00Z'), // 18:30+09:00
      expected: [
        {
          start: new Date('2024-01-01T11:00:00+09:00'),
          end: new Date('2024-01-01T13:00:00+09:00'),
        },
        {
          start: new Date('2024-01-01T14:00:00+09:00'),
          end: new Date('2024-01-01T18:30:00+09:00'),
        },
      ],
    },
    {
      scenario: '入力がUTC',
      start: new Date('2023-12-06T09:02:14Z'), // 12/06 (水) 18:02:14+09:00
      end: new Date('2023-12-12T03:47:16Z'), // 12/12 (月) 12:47:16+09:00
      expected: [
        // 12/06 (水) 18:02:14+09:00 - 12/06 (水) 19:00:00+09:00
        {
          start: new Date('2023-12-06T18:02:14+09:00'),
          end: new Date('2023-12-06T19:00:00+09:00'),
        },

        // 12/07 (木) 10:00:00+09:00 - 12/07 (木) 19:00:00+09:00
        {
          start: new Date('2023-12-07T10:00:00+09:00'),
          end: new Date('2023-12-07T13:00:00+09:00'),
        },
        {
          start: new Date('2023-12-07T14:00:00+09:00'),
          end: new Date('2023-12-07T19:00:00+09:00'),
        },

        // 12/08 (金) 10:00:00+09:00 - 12/08 (金) 19:00:00+09:00
        {
          start: new Date('2023-12-08T10:00:00+09:00'),
          end: new Date('2023-12-08T13:00:00+09:00'),
        },
        {
          start: new Date('2023-12-08T14:00:00+09:00'),
          end: new Date('2023-12-08T19:00:00+09:00'),
        },

        // 12/11 (月) 10:00:00+09:00 - 12/11 (月) 19:00:00+09:00
        {
          start: new Date('2023-12-11T10:00:00+09:00'),
          end: new Date('2023-12-11T13:00:00+09:00'),
        },
        {
          start: new Date('2023-12-11T14:00:00+09:00'),
          end: new Date('2023-12-11T19:00:00+09:00'),
        },

        // 12/12 (火) 10:00:00+09:00 - 12/12 (火) 12:47:16+09:00
        {
          start: new Date('2023-12-12T10:00:00+09:00'),
          end: new Date('2023-12-12T12:47:16+09:00'),
        },
      ],
    },
    {
      scenario: '終業後に作業開始し、翌日始業前に作業終了',
      start: new Date('2024-01-01T20:00:00+09:00'),
      end: new Date('2024-01-02T09:30:00+09:00'),
      expected: [
        {
          start: new Date('2024-01-01T20:00:00+09:00'),
          end: new Date('2024-01-01T20:00:00+09:00'),
        },
        {
          start: new Date('2024-01-02T09:30:00+09:00'),
          end: new Date('2024-01-02T09:30:00+09:00'),
        },
      ],
    },
    {
      scenario: '終業後に作業開始し、翌日始業後に作業終了',
      start: new Date('2024-01-01T19:00:00+09:00'),
      end: new Date('2024-01-02T12:00:00+09:00'),
      expected: [
        {
          start: new Date('2024-01-01T19:00:00+09:00'),
          end: new Date('2024-01-01T19:00:00+09:00'),
        },
        {
          start: new Date('2024-01-02T10:00:00+09:00'),
          end: new Date('2024-01-02T12:00:00+09:00'),
        },
      ],
    },
    {
      scenario: '終業後に作業開始し、就業日境界以内に作業終了',
      start: new Date('2024-01-01T20:00:00+09:00'),
      end: new Date('2024-01-02T03:00:00+09:00'),
      expected: [
        {
          start: new Date('2024-01-01T20:00:00+09:00'),
          end: new Date('2024-01-02T03:00:00+09:00'),
        },
      ],
    },
    {
      scenario: '始業前に作業開始し、始業前に作業終了',
      start: new Date('2024-01-01T09:00:00+09:00'),
      end: new Date('2024-01-01T09:30:00+09:00'),
      expected: [
        {
          start: new Date('2024-01-01T09:00:00+09:00'),
          end: new Date('2024-01-01T09:30:00+09:00'),
        },
      ],
    },
  ] satisfies Scenario[])('$scenario', ({ start, end, expected }) => {
    const OPTIONS: EachTaskTimeIntervalOptions = {
      workStart: '10:00+09:00',
      workEnd: '19:00+09:00',
      workPeriod: '05:00+09:00',
      breakStart: '13:00+09:00',
      breakEnd: '14:00+09:00',
    }
    expect(eachTaskTimeInterval(start, end, OPTIONS)).toEqual(expected)
  })
})
