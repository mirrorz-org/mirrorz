import React, { useEffect, useState, useMemo, useCallback } from "react";
import Icon from './Icon';

const STATUS_TEXT_MAPPING = {
  S: 'Success',
  Y: 'Syncing',
  F: 'Failed',
  P: 'Paused',
  U: 'Unknown',
  O: 'Last Success',
  X: 'Next',
  N: 'New',
};

const STATUS_ICON_MAPPING = {
  S: 'done',
  Y: 'sync',
  F: 'error',
  P: 'pause',
  U: 'info',
  O: 'done',
  X: 'east',
  N: 'new_releases',
};

const STATUS_CLASS_MAPPING = {
  S: 'success',
  P: 'pause',
  Y: 'syncing',
  F: 'failed',
  U: 'unknown',
  O: 'oldsuccess',
  X: 'next',
  N: 'new',
};

type STATUS_TYPE = keyof typeof STATUS_CLASS_MAPPING;

const MAIN_STATUS: STATUS_TYPE[] = ["S", "Y", "F", "P", "U"];
const ALL_STATUS: STATUS_TYPE[] = ["S", "Y", "F", "P", "U", "O", "X", "N"];


export const statusMapper = (status: string) => {
  const mapper: { [_: string]: number } = {};
  status.match(/[A-Z](\d+)?/g)?.map((s) => {
    const c = s[0];
    const t = s.length > 1 ? parseInt(s.substr(1)) : 0;
    mapper[c] = t;
  });
  return mapper;
};

export const statusSum = (array: { [_: string]: number }[]) => {
  const sum: { [_ in STATUS_TYPE]?: number } = {};
  array.map((mapper) => {
    MAIN_STATUS.map((s: STATUS_TYPE) => {
      if (s in mapper) sum[s] = (sum[s] ?? 0) + 1;
    });
  });
  return sum;
};

export const Summary = React.memo(({ sum }: { sum: { [_ in STATUS_TYPE]?: number } }) => {
  return (
    <h2 className="summary">
      {MAIN_STATUS.map((s) => {
        if ((sum[s] ?? 0) !== 0)
          return (
            <span className={STATUS_CLASS_MAPPING[s]} key={s}>
              {sum[s]}
              <Icon>{STATUS_ICON_MAPPING[s]}</Icon>
            </span>
          )
      })}
    </h2>
  )
});

const absoluteFormat = (date: Date) => {
  // https://stackoverflow.com/questions/2998784/how-to-output-numbers-with-leading-zeros-in-javascript
  const pad = (num: number, size: number) => {
    let numString = num.toString();
    while (numString.length < size) numString = "0" + numString;
    return numString;
  }
  const offset = - date.getTimezoneOffset() / 60;
  const offsetStr = offset > 0 ? '+' + offset.toString() : offset.toString();
  return date.getFullYear().toString() + '-' +
    pad(date.getMonth() + 1, 2) + '-' + // month ranges from 0 to 11
    pad(date.getDate(), 2) + ' ' +
    pad(date.getHours(), 2) + ':' +
    pad(date.getMinutes(), 2) + ':' +
    pad(date.getSeconds(), 2) + ' UTC' + offsetStr;
}

const relativeFormat = (date: Date) => {
  const plural = (numf: number, str: string, prefix: string, suffix: string) => {
    const num = Math.round(numf);
    return prefix +
      num.toString() + " " +
      (num == 1 ? str : str + "s") +
      suffix;
  }
  const agoF = (num: number, str: string) => plural(num, str, "", " ago");
  const inF = (num: number, str: string) => plural(num, str, "in ", "");

  const scale = [60, 60, 24, 30, 365, 1e15];
  const scaleStr = ["second", "minute", "hour", "day", "month", "year"];
  const now = Date.now(), dateValue = date.valueOf();
  let offset = (now > dateValue ? (now - dateValue) : (dateValue - now)) / 1000;
  for (let i = 0; i != scale.length; ++i) {
    if (offset < scale[i])
      return now > dateValue ? agoF(offset, scaleStr[i]) : inF(offset, scaleStr[i]);
    offset /= scale[i];
  }
}

export const StatusList = React.memo(({ mapper }: { mapper: { [_: string]: number } }) => {
  return (
    <div>
      {ALL_STATUS.map((s) => {
        if (s in mapper)
          return (
            <div className={"status " + STATUS_CLASS_MAPPING[s]} key={s}>
              <Icon>{STATUS_ICON_MAPPING[s]}</Icon>
              <div>{STATUS_TEXT_MAPPING[s]}</div>
              {mapper[s] !== 0 && (
                <div className="status-time">
                  <div>{"| " + absoluteFormat(new Date(mapper[s] * 1000))}</div>
                  <div>{"| " + relativeFormat(new Date(mapper[s] * 1000))}</div>
                </div>
              )}
            </div>
          )
      })}
    </div>
  )
});
