const port = process.env.PORT || 8080;

import { app, express } from "./app";
import { FeedbackService } from "./feedback/feedback";
import DataStore from "../test/mocks/dataStore";
import FeedbackController from "./feedback/feedbackController";

import TestData from "../test/mocks/testData";
import moment from "moment";

const Formats = require("./lib/formats");
const USER_PTR = TestData.USER_PTR;
const USER_PTR2 = TestData.USER_PTR2;
const COURSE_PTR = TestData.COURSE_PTR;
const INFRA_PTR = TestData.INFRA_PTR;
const PARTNER_PTR = TestData.PARTNER_PTR;

const dataStore = new DataStore({ data: TestData.DATA });
const feedback = new FeedbackService({ dataStore });
const feedbackController = new FeedbackController({ feedback });

const BASE = "/api/v1/";
app.use(BASE + "status/", function(req, res, next) {
  res.json({ status: "ok", env: process.env.NODE_ENV });
});
app.use(BASE + "feedback/", feedbackController.router);

console.log("starting app...");
app.listen(port);
console.log("App started ENV", process.env.NODE_ENV);
console.log("running on port", port);
