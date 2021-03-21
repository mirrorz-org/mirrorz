export type Mirrorz = {
    version?: number,
    site: Site,
    info: Info[],
    mirrors: Mirror[],
};

export type Site = {
    url: string,
    abbr: string,
    name?: string,
    logo?: string,
    logo_darkmode?: string,
    homepage?: string,
    issue?: string,
    request?: string,
    email?: string,
    group?: string,
    disk?: string,
    note?: string,
    big?: string,
};

export type Info = {
    category: string,
    distro: string,
    urls: { name: string, url: string }[]
};

export type Mirror = {
    cname: string,
    url: string,
    status: string,
    desc?: string,
    help?: string,
    upstream?: string,
    size?: string,
};

export type ParsedMirror = {
    cname: string;
    full: string;
    help: string | null;
    upstream: string | undefined;
    desc: string | undefined;
    status: string;
    size: string | undefined;
    source: string;
    note: string | undefined;
};