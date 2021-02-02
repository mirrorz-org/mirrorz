import React, { useEffect, useState, useMemo, useCallback } from "react";
import Icon from './Icon';

const MAIN_STATUS = ["S", "Y", "F", "P", "U"];
const ALL_STATUS = ["S", "Y", "F", "P", "U", "O", "X", "N"];

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


export const statusMapper = (status) => {
  const mapper = new Map();
  status.match(/[A-Z](\d+)?/g).map((s) => {
    const c = s[0];
    const t = s.length > 1 ? parseInt(s.substr(1)) : 0;
    mapper.set(c, t);
  });
  return mapper;
};

export const statusSum = (array) => {
  const sum = new Map();
  array.map((mapper) => {
    MAIN_STATUS.map((s) => { 
      if (!sum.has(s)) sum.set(s, 0);
      if (mapper.has(s)) sum.set(s, sum.get(s) + 1);
    });
  });
  return sum;
};

export const Summary = React.memo(({ sum, num = true }) => {
  return (
    <h2 className="summary">
      {MAIN_STATUS.map((s) => { 
        if(sum.has(s) && sum.get(s) != 0)
          return (
            <span className={STATUS_CLASS_MAPPING[s]} key={s}>
              {num && sum.get(s)}
              <Icon>{STATUS_ICON_MAPPING[s]}</Icon>
            </span>
          )
      })}
    </h2>
  )
});

const absoluteFormat = (date) => {
  // https://stackoverflow.com/questions/2998784/how-to-output-numbers-with-leading-zeros-in-javascript
  const pad = (num, size) => {
    num = num.toString();
    while (num.length < size) num = "0" + num;
    return num;
  }
  const offset = - date.getTimezoneOffset() / 60;
  const offsetStr = offset > 0 ? '+' + offset.toString() : offset.toString();
  return date.getFullYear().toString() + '-' +
    pad(date.getMonth()+1, 2) + '-' + // month ranges from 0 to 11
    pad(date.getDate(), 2) + ' ' +
    pad(date.getHours(), 2) + ':' +
    pad(date.getMinutes(), 2) + ':' +
    pad(date.getSeconds(), 2) + ' UTC' + offsetStr;
}

const relativeFormat = (date) => {
  const plural = (numf, str, prefix, suffix) => {
    const num = Math.round(numf);
    return prefix +
      num.toString() + " " +
      (num == 1 ? str : str + "s") +
      suffix;
  }
  const agoF = (num, str) => plural(num, str, "", " ago");
  const inF = (num, str) => plural(num, str, "in ", "");

  const scale = [60, 60, 24, 30, 365, 1e15];
  const scaleStr = ["second", "minute", "hour", "day", "month", "year"];
  const now = new Date();
  let offset = (now > date ? (now - date) : (date - now)) / 1000;
  for (let i = 0; i != scale.length; ++i) {
    if (offset < scale[i])
      return now > date ? agoF(offset, scaleStr[i]) : inF(offset, scaleStr[i]);
    offset /= scale[i];
  }
}

export const StatusList = React.memo(({ mapper }) => {
  return (
    <div>
      {ALL_STATUS.map((s) => {
        if(mapper.has(s))
          return (
            <div className={"status "+STATUS_CLASS_MAPPING[s]} key={s}>
              <Icon>{STATUS_ICON_MAPPING[s]}</Icon>
              <div>{STATUS_TEXT_MAPPING[s]}</div>
              {mapper.get(s) != 0 && (
                <div className="status-time">
                  <div>{"| " + absoluteFormat(new Date(mapper.get(s)*1000))}</div>
                  <div>{"| " + relativeFormat(new Date(mapper.get(s)*1000))}</div>
                </div>
              )}
            </div>
          )
      })}
    </div>
  )
});
