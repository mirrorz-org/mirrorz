import React from "react";
import { useTranslation } from "react-i18next";
import { RepoScoring } from "../schema/scoring";
import config from "../config/config.json";

export default React.memo(
  ({
    scoringSites,
    repository,
    preferences,
    excluded,
    setPreferences,
    setExcluded,
  }: {
    scoringSites: RepoScoring[];
    repository?: string;
    preferences: string[];
    excluded: string[];
    setPreferences: React.Dispatch<React.SetStateAction<string[]>>;
    setExcluded: React.Dispatch<React.SetStateAction<string[]>>;
  }) => {
    const { t } = useTranslation();
    const [preference, setPreference] = React.useState("");
    const [exclusion, setExclusion] = React.useState("");
    const labelsByAbbr = new Map(
      scoringSites.map(({ abbr, label }) => [abbr, label])
    );
    const availableSites = scoringSites.filter(
      ({ abbr }) => !preferences.includes(abbr) && !excluded.includes(abbr)
    );
    const canAddPreference = availableSites.some(
      (site) => site.abbr === preference
    );
    const canAddExclusion = availableSites.some(
      (site) => site.abbr === exclusion
    );
    const prefixParts = [
      ...preferences.map((abbr) => labelsByAbbr.get(abbr)),
      ...excluded.map((abbr) => {
        const label = labelsByAbbr.get(abbr);
        return label ? `avoid${label}` : undefined;
      }),
    ].filter((label): label is string => !!label);
    const prefix = [...new Set(prefixParts)].join("-");
    const base = new URL(config.url);
    const hostname = prefix ? `${prefix}.${base.hostname}` : base.hostname;
    const validAddress = prefix.length <= 63;
    const normalizedPath = repository
      ? `/${repository.split("/").map(encodeURIComponent).join("/")}/`
      : "/";
    const address = `${base.protocol}//${hostname}${
      base.port ? `:${base.port}` : ""
    }${normalizedPath}`;

    const addPreference = () => {
      if (!canAddPreference) return;
      setPreferences((current) => [...current, preference]);
      setPreference("");
    };
    const addExclusion = () => {
      if (!canAddExclusion) return;
      setExcluded((current) => [...current, exclusion]);
      setExclusion("");
    };
    const movePreference = (index: number, offset: number) => {
      const nextIndex = index + offset;
      if (nextIndex < 0 || nextIndex >= preferences.length) return;
      setPreferences((current) => {
        const next = [...current];
        [next[index], next[nextIndex]] = [next[nextIndex], next[index]];
        return next;
      });
    };
    const removeFrom = (list: "preference" | "excluded", abbr: string) => {
      if (list === "preference")
        setPreferences((current) => current.filter((item) => item !== abbr));
      else setExcluded((current) => current.filter((item) => item !== abbr));
    };

    return (
      <div className="redirect-generator">
        <div className="redirect-generator-grid">
          <div className="redirect-generator-field">
            <label htmlFor="redirect-preference">
              {t("about.302_go_generator_preference")}
            </label>
            <div className="redirect-generator-add">
              <select
                id="redirect-preference"
                value={preference}
                onChange={(event) => setPreference(event.target.value)}
              >
                <option value="">{t("about.302_go_generator_choose")}</option>
                {availableSites.map(({ abbr }) => (
                  <option key={abbr} value={abbr}>
                    {abbr}
                  </option>
                ))}
              </select>
              <button
                type="button"
                onClick={addPreference}
                disabled={!canAddPreference}
              >
                {t("about.302_go_generator_add")}
              </button>
              <ol className="redirect-generator-list">
                {preferences.map((abbr, index) => (
                  <li key={abbr}>
                    <code>{abbr}</code>
                    <button
                      type="button"
                      onClick={() => movePreference(index, -1)}
                      disabled={index === 0}
                      aria-label={t("about.302_go_generator_move_up")}
                    >
                      ←
                    </button>
                    <button
                      type="button"
                      onClick={() => movePreference(index, 1)}
                      disabled={index === preferences.length - 1}
                      aria-label={t("about.302_go_generator_move_down")}
                    >
                      →
                    </button>
                    <button
                      type="button"
                      onClick={() => removeFrom("preference", abbr)}
                      aria-label={t("about.302_go_generator_remove")}
                    >
                      ×
                    </button>
                  </li>
                ))}
              </ol>
            </div>
          </div>
          <div className="redirect-generator-field">
            <label htmlFor="redirect-exclusion">
              {t("about.302_go_generator_exclusion")}
            </label>
            <div className="redirect-generator-add">
              <select
                id="redirect-exclusion"
                value={exclusion}
                onChange={(event) => setExclusion(event.target.value)}
              >
                <option value="">{t("about.302_go_generator_choose")}</option>
                {availableSites.map(({ abbr }) => (
                  <option key={abbr} value={abbr}>
                    {abbr}
                  </option>
                ))}
              </select>
              <button
                type="button"
                onClick={addExclusion}
                disabled={!canAddExclusion}
              >
                {t("about.302_go_generator_add")}
              </button>
              <ul className="redirect-generator-list">
                {excluded.map((abbr) => (
                  <li key={abbr}>
                    <code>{abbr}</code>
                    <button
                      type="button"
                      onClick={() => removeFrom("excluded", abbr)}
                      aria-label={t("about.302_go_generator_remove")}
                    >
                      ×
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
        <div className="redirect-generator-result">
          <span>{t("about.302_go_generator_result")}</span>
          {!repository ? (
            <span>{t("about.302_go_generator_select_repository")}</span>
          ) : validAddress ? (
            <a href={address}>
              <code>{address}</code>
            </a>
          ) : (
            <span role="alert">{t("about.302_go_generator_too_long")}</span>
          )}
        </div>
      </div>
    );
  }
);
