import React, { useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  BrowserRouter as Router,
  Switch,
  Route,
  NavLink,
} from "react-router-dom";
import Mirrors from "./Mirrors";
import ISO from "./ISO";
import Site from "./Site";
import About from "./About";
import Debug from "./Debug";
import Monitor from "./Monitor";
import Icon from "./Icon";
import {
  useIsoInfoList,
  useMirrorsList,
  useMirrorzSites,
  useSitesList,
  useScoring,
} from "./hooks";
import { Page404 } from "./404";

import config from "../config/config.json";
import { RedirectSitesContext } from "./RedirectBadge";
import { Theme, ThemeContext, ThemePreference } from "./theme";

type Language = "en" | "zh";

const getSystemTheme = (): Theme =>
  window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";

const getInitialThemePreference = (): ThemePreference => {
  const saved = document.documentElement.dataset.theme;
  if (saved === "light" || saved === "dark") return saved;
  return "system";
};

// eslint-disable-next-line react/display-name
export default React.memo(() => {
  const { t, i18n } = useTranslation();
  const [themePreference, setThemePreference] = useState<ThemePreference>(
    getInitialThemePreference
  );
  const [systemTheme, setSystemTheme] = useState<Theme>(getSystemTheme);
  const theme = themePreference === "system" ? systemTheme : themePreference;
  const language: Language = i18n.language.startsWith("zh") ? "zh" : "en";
  const [settingsOpen, setSettingsOpen] = useState(false);
  const settingsButton = useRef<HTMLButtonElement>(null);
  const settingsPanel = useRef<HTMLDivElement>(null);
  const mirrorz = useMirrorzSites();
  const scoring = useScoring();
  const redirectSites = useMemo(
    () => new Set(scoring?.scores.map(({ abbr }) => abbr) ?? []),
    [scoring]
  );

  const mirrorzList = useMemo(() => Object.values(mirrorz), [mirrorz]);
  const mirrorsList = useMirrorsList(mirrorz);
  const isoinfoList = useIsoInfoList(mirrorz, scoring);
  const siteList = useSitesList(mirrorz, scoring);

  useEffect(() => {
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const updateFromSystem = (event: MediaQueryListEvent) => {
      setSystemTheme(event.matches ? "dark" : "light");
    };
    media.addEventListener("change", updateFromSystem);
    return () => media.removeEventListener("change", updateFromSystem);
  }, []);

  useEffect(() => {
    if (!settingsOpen) return;
    const closeOnOutsideClick = (event: MouseEvent) => {
      const target = event.target as Node;
      if (
        !settingsButton.current?.contains(target) &&
        !settingsPanel.current?.contains(target)
      )
        setSettingsOpen(false);
    };
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setSettingsOpen(false);
        settingsButton.current?.focus();
      }
    };
    document.addEventListener("mousedown", closeOnOutsideClick);
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("mousedown", closeOnOutsideClick);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [settingsOpen]);

  const selectTheme = (preference: ThemePreference) => {
    if (preference === "system") {
      delete document.documentElement.dataset.theme;
    } else {
      document.documentElement.dataset.theme = preference;
    }
    try {
      if (preference === "system") localStorage.removeItem("mirrorz-theme");
      else localStorage.setItem("mirrorz-theme", preference);
    } catch (_) {}
    setThemePreference(preference);
  };

  const selectLanguage = (nextLanguage: Language) => {
    try {
      localStorage.setItem("mirrorz-language", nextLanguage);
    } catch (_) {}
    document.documentElement.lang = nextLanguage;
    i18n.changeLanguage(nextLanguage);
  };

  return (
    <ThemeContext.Provider value={theme}>
      <RedirectSitesContext.Provider value={redirectSites}>
        <Router>
          <div id="app-container">
            <div className="sidebar">
              <NavLink
                to="/"
                className="sidebar-brand"
                activeClassName="active"
                isActive={(_, location) =>
                  location.pathname === "/" || location.pathname === "/about"
                }
              >
                <img
                  src="/static/img/mirrorz.svg"
                  className="sidebar-logo"
                  alt={config.display || "MirrorZ"}
                />
              </NavLink>
              <NavLink
                to="/os"
                activeClassName="active"
                isActive={(_, location) =>
                  ["/os", "/app", "/font"].some(
                    (path) =>
                      location.pathname === path ||
                      location.pathname.startsWith(path + "/")
                  )
                }
              >
                <Icon aria-hidden="true">get_app</Icon>
                <h2>{t("download")}</h2>
              </NavLink>
              <NavLink to="/list" activeClassName="active">
                <Icon aria-hidden="true">list_alt</Icon>
                <h2>{t("list.list")}</h2>
              </NavLink>
              <NavLink to="/site" activeClassName="active">
                <Icon aria-hidden="true">dns</Icon>
                <h2>{t("site.site")}</h2>
              </NavLink>
              {config.mirrors_help_url && (
                <a
                  href={config.mirrors_help_url}
                  target="_blank"
                  rel="noopener"
                  title={t("opens_new_tab")}
                  aria-label={`${t("help")}, ${t("opens_new_tab")}`}
                >
                  <Icon aria-hidden="true">help_outline</Icon>
                  <h2>
                    {t("help")}
                    <span className="external-link-icon" aria-hidden="true">
                      ↗
                    </span>
                  </h2>
                </a>
              )}
              <button
                type="button"
                className="settings-toggle"
                onClick={() => setSettingsOpen((open) => !open)}
                aria-expanded={settingsOpen}
                aria-controls="settings-panel"
                aria-haspopup="dialog"
                ref={settingsButton}
              >
                <Icon aria-hidden="true">settings</Icon>
                <span className="nav-label">{t("settings")}</span>
              </button>
            </div>
            {settingsOpen && (
              <div
                className="settings-panel"
                id="settings-panel"
                role="dialog"
                aria-label={t("settings")}
                ref={settingsPanel}
              >
                <div className="settings-panel-title">{t("settings")}</div>
                <div className="settings-section">
                  <div className="settings-section-label">
                    <Icon aria-hidden="true">contrast</Icon>
                    <strong>{t("theme")}</strong>
                  </div>
                  <div
                    className="settings-options theme-options"
                    role="radiogroup"
                    aria-label={t("theme")}
                  >
                    {(
                      [
                        ["system", "computer", t("system_theme")],
                        ["light", "light_mode", t("light_theme")],
                        ["dark", "dark_mode", t("dark_theme")],
                      ] as [ThemePreference, string, string][]
                    ).map(([preference, icon, label]) => (
                      <button
                        type="button"
                        className={
                          "settings-choice theme-option" +
                          (themePreference === preference ? " active" : "")
                        }
                        data-theme={preference}
                        role="radio"
                        aria-checked={themePreference === preference}
                        onClick={() => selectTheme(preference)}
                        key={preference}
                      >
                        <Icon aria-hidden="true">{icon}</Icon>
                        <span>{label}</span>
                      </button>
                    ))}
                  </div>
                </div>
                <div className="settings-section">
                  <div className="settings-section-label">
                    <Icon aria-hidden="true">language</Icon>
                    <strong>{t("language")}</strong>
                  </div>
                  <div
                    className="settings-options language-options"
                    role="radiogroup"
                    aria-label={t("language")}
                  >
                    {(
                      [
                        ["en", "EN", t("english")],
                        ["zh", "中", t("chinese")],
                      ] as [Language, string, string][]
                    ).map(([nextLanguage, symbol, label]) => (
                      <button
                        type="button"
                        className={
                          "settings-choice language-option" +
                          (language === nextLanguage ? " active" : "")
                        }
                        data-language={nextLanguage}
                        role="radio"
                        aria-checked={language === nextLanguage}
                        onClick={() => selectLanguage(nextLanguage)}
                        key={nextLanguage}
                      >
                        <strong aria-hidden="true">{symbol}</strong>
                        <span>{label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
            <main>
              <Switch>
                <Route path="/list/:filter?" exact>
                  <Mirrors mirrors={mirrorsList} />
                </Route>
                <Route path="/site/:siteSlug?/:statusFilter?" exact>
                  <Site site={siteList} />
                </Route>
                <Route path={["/", "/about"]} exact>
                  <About site={siteList} />
                </Route>
                <Route path="/debug" exact>
                  <Debug mirrorz={mirrorzList} />
                </Route>
                <Route path="/monitor" exact>
                  <Monitor />
                </Route>
                <Route path="/:category/:distro?" exact>
                  <ISO isoinfo={isoinfoList} />
                </Route>
                <Page404 />
              </Switch>
            </main>
          </div>
        </Router>
      </RedirectSitesContext.Provider>
    </ThemeContext.Provider>
  );
});
