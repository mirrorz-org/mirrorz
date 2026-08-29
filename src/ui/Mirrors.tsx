import React, {
  useState,
  useMemo,
  useCallback,
  useLayoutEffect,
  useRef,
} from "react";
import { useTranslation } from "react-i18next";
import {
  Link,
  useRouteMatch,
  useParams,
  generatePath,
  useHistory,
} from "react-router-dom";
import Icon from "./Icon";
import { Summary, statusMapper, statusSum, StatusList } from "./Status";
import { ParsedMirror } from "../schema";
import { groupBy } from "./utils";
import { RedirectBadge } from "./RedirectBadge";

const Group = React.memo(
  ({
    group,
    entries,
    filtered,
    expanded,
    onToggle,
  }: {
    group: string;
    entries: ParsedMirror[];
    filtered: boolean;
    expanded: boolean;
    onToggle: (group: string) => void;
  }) => {
    const match = useRouteMatch();
    const toggleExpanded = useCallback(
      () => onToggle(group),
      [group, onToggle]
    );

    const summary = useMemo(
      () => (
        <Summary
          sum={statusSum(entries.map(({ status }) => statusMapper(status)))}
        />
      ),
      [entries]
    );

    return (
      <div
        className={
          "group" +
          (filtered ? " filtered" : "") +
          (expanded ? " group-expanded" : "")
        }
      >
        <Link
          to={generatePath(match.path, { filter: encodeURIComponent(group) })}
        >
          <div className="group-header" id={group} onClick={toggleExpanded}>
            <h2 className="heading">
              {expanded ? <Icon>expand_more</Icon> : <Icon>chevron_right</Icon>}
              {group}
            </h2>
            <div>{summary}</div>
          </div>
        </Link>
        <div className="group-items">
          {expanded &&
            entries
              .sort((a, b) => a.source.localeCompare(b.source))
              .map(
                (
                  { full, help, upstream, desc, status, source, size, note },
                  idx
                ) => (
                  <div key={idx}>
                    <h3>
                      <a className="mirror-source" href={full} target="_blank">
                        {source}
                        <RedirectBadge abbr={source} />
                      </a>
                      {help && (
                        <a className="help" href={help} target="_blank">
                          <Icon title="Help">help</Icon>
                        </a>
                      )}
                    </h3>
                    {upstream && (
                      <div className="upstream">
                        <Icon>outbound</Icon>
                        {upstream}
                      </div>
                    )}
                    {status && <StatusList mapper={statusMapper(status)} />}
                    {size && (
                      <div className="size">
                        <Icon>save</Icon>
                        {size}
                      </div>
                    )}
                    {note && (
                      <div className="note">
                        <Icon>note</Icon>
                        {note}
                      </div>
                    )}
                    {desc && <div className="desc">{desc}</div>}
                  </div>
                )
              )}
        </div>
      </div>
    );
  }
);

export default React.memo(({ mirrors }: { mirrors: ParsedMirror[] }) => {
  const { t, i18n } = useTranslation();
  const history = useHistory(),
    match = useRouteMatch(),
    params = useParams() as { filter?: string };
  const [filter, setFilter] = useState(params.filter ?? "");
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(
    () => new Set(params.filter ? [params.filter] : [])
  );
  const [columnCount, setColumnCount] = useState(1);
  const mirrorsRef = useRef<HTMLDivElement>(null);

  const toggleGroup = useCallback((group: string) => {
    setExpandedGroups((current) => {
      const next = new Set(current);
      if (next.has(group)) next.delete(group);
      else next.add(group);
      return next;
    });
  }, []);

  useLayoutEffect(() => {
    const mirrorsElement = mirrorsRef.current;
    if (!mirrorsElement) return;

    const updateColumnCount = () => {
      const style = getComputedStyle(mirrorsElement);
      const width =
        mirrorsElement.clientWidth -
        parseFloat(style.paddingLeft) -
        parseFloat(style.paddingRight);
      setColumnCount(Math.max(1, Math.floor((width + 36) / (380 + 36))));
    };
    updateColumnCount();

    const observer = new ResizeObserver(updateColumnCount);
    observer.observe(mirrorsElement);
    return () => observer.disconnect();
  }, []);

  // Clustering
  const grouped = useMemo(
    () =>
      Object.entries(groupBy(mirrors, (m) => m.cname))
        .map(([k, v]) => ({ sortKey: k.toLowerCase(), group: k, entries: v }))
        .filter(({ group }) => group !== ""),
    [mirrors]
  );

  const updateFilter = useCallback((ev) => setFilter(ev.target.value), []);
  const clearFilter = useCallback(() => {
    setFilter("");
    history.push(generatePath(match.path, {}));
  }, [history, match.path]);
  const uploadFilter = useCallback((ev) => {
    if (ev.key === "Enter")
      history.push(generatePath(match.path, { filter: ev.target.value }));
  }, []);

  const regex = useMemo(() => {
    let regex;
    try {
      if (filter === "") regex = null;
      // user input may be invalid regex
      else regex = new RegExp(filter, "i");
    } catch (error) {
      regex = null;
    }
    if (regex !== null) console.log("valid regex:", regex);
    return regex;
  }, [filter]);
  const begin = performance.now();
  const filtered = grouped
    .map((e) => {
      let m = null;
      let filtered = false;
      let index = 1e15;
      if (regex !== null) {
        m = regex.exec(e.group);
        filtered = m === null;
        if (!filtered) index = m!.index;
      }
      return { ...e, filtered, index };
    })
    .sort((a, b) => {
      if (a.index == b.index) return a.sortKey.localeCompare(b.sortKey);
      return a.index - b.index;
    });
  const end = performance.now();
  //console.log(`Sort`, end - begin);

  const shownCount = filtered.filter(({ filtered }) => !filtered).length;
  const siteCount = useMemo(
    () => new Set(mirrors.map(({ source }) => source)).size,
    [mirrors]
  );
  const visibleGroups = filtered.filter(({ filtered }) => !filtered);
  const columns = Array.from(
    { length: columnCount },
    () => [] as typeof visibleGroups
  );
  visibleGroups.forEach((group, index) =>
    columns[index % columnCount].push(group)
  );

  return (
    <div className={"mirrorz"}>
      <div className="toolbar">
        <div className="search">
          <span className={"search-leading" + (filter === "" ? " empty" : "")}>
            <Icon aria-hidden="true">search</Icon>
          </span>
          <input
            value={filter}
            onChange={updateFilter}
            onKeyDown={uploadFilter}
            placeholder={t("mirrors_prompt")}
          />
          <button
            type="button"
            className="search-clear"
            onClick={clearFilter}
            disabled={filter === ""}
            title={t("clear_filter")}
            aria-label={t("clear_filter")}
          >
            <Icon aria-hidden="true">close</Icon>
          </button>
        </div>
        <span className="result-count" role="status">
          {t("mirrors_count", {
            shown: shownCount,
            total: grouped.length,
            sites: siteCount,
          })}
        </span>
      </div>

      <div className="mirrors" ref={mirrorsRef}>
        {columns.map((column, columnIndex) => (
          <div className="mirror-column" key={columnIndex}>
            {column.map(({ group, entries, filtered }) => (
              <Group
                key={group}
                filtered={filtered}
                group={group}
                entries={entries}
                expanded={expandedGroups.has(group)}
                onToggle={toggleGroup}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
});
