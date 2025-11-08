import { Application } from "@hotwired/stimulus";
import { definitionsFromContext } from "@hotwired/stimulus-webpack-helpers";

// Auto-import all controllers as per stimulus documentation.
// https://stimulus.hotwired.dev/handbook/installing#using-webpack-helpers
window.Stimulus = Application.start();
const context = require.context("./scripts/controllers", true, /\.js$/);
Stimulus.load(definitionsFromContext(context));
