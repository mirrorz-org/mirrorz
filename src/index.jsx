import React from "react";
import ReactDOM from "react-dom";
import Root from "./ui/Root";
import "./css/style.scss";
import("@fontsource/noto-sans-sc/400.css"); // Async load
import("@fontsource/noto-sans-sc/700.css"); // Async load
import "./i18n";

function bootstrap() {
  console.log("Meow: bootstrap");
  ReactDOM.render(<Root />, document.getElementById("app"));
}

window.addEventListener("DOMContentLoaded", bootstrap);
