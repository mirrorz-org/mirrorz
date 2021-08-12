import React from "react";
import ReactDOM from "react-dom";
import Root from "./ui/Root";
import "./css/style.scss";
import("./css/deferred.scss"); // Async load
import './i18n/';

function bootstrap() {
  console.log("Meow: bootstrap");
  ReactDOM.render(<Root />, document.getElementById("app"));
}

window.addEventListener('DOMContentLoaded', bootstrap);
