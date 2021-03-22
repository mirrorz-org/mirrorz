
const PROTO_REGEX = /(^https?:)?\/\//;

export const stringIsNullOrEmpty = (s: string | null | undefined) =>
    s === null || s === undefined || s === "";

export const absoluteUrlOrConcatWithBase = (url: string, baseUrl: string) =>
    url.match(PROTO_REGEX) ? url : baseUrl + url;


export const emptyOrAbsolutUrlOrConcatWithBase = (url: string | null | undefined, baseUrl: string) =>
    stringIsNullOrEmpty(url) ? null : absoluteUrlOrConcatWithBase(url!, baseUrl);