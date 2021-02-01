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
  O: 'Old Success',
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
                <div>{": " + mapper.get(s).toString()}</div>
              )}
            </div>
          )
      })}
    </div>
  )
});
