import "./App.css";

import React, { Fragment } from "react";

//components

import Input from "./components/Input";
import List from "./components/List";

function App() {
  return (
    <Fragment>
      <div className="container">
        <Input />
        <List />
      </div>
    </Fragment>
  );
}

export default App;
