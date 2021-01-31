import Root from "./Root";
import React from "react";
import ReactDOM from "react-dom";
import "./css/style.scss";

function bootstrap() {
  console.log("Meow: bootstrap");
  ReactDOM.render(<Root />, document.getElementById("app"));
}

window.bootstrap = bootstrap;
