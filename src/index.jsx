import Root from "./Root";
import React from "react";
import ReactDOM from "react-dom";
import "./css/style.scss";
import("./css/deferred.scss"); // Async load

function bootstrap() {
  console.log("Meow: bootstrap");
  ReactDOM.render(<Root />, document.getElementById("app"));
}

window.addEventListener('DOMContentLoaded', bootstrap);
