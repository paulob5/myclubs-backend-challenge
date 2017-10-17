const express = require("express");

class FeedbackController {
  constructor(options) {
    this.feedback = options.feedback;

    this.router = express.Router();

    this.router.post("/", this.submit);
    this.router.get("/terms/:bookingId", this.getTerms);
    this.router.get("/users/:userId", this.getAverageUserRating);
    this.router.get("/", this.getRequired);
  }
  submit = async (req, res, next) => {
    try {
      const data = {
        user: req.user,
        source: req.source,
        bookingId: req.body.bookingId,
        terms: req.body.terms,
        comment: req.body.comment,
        value: req.body.value
      };
      const json = await this.feedback.submit(data);
      res.json(json);
    } catch (e) {
      next(e);
    }
  };
  getRequired = async (req, res, next) => {
    try {
      const data = {
        //user: req.user,
        user: {
          objectId: "userID",
          __type: "Pointer",
          className: "_User"
        }
      };
      const json = await this.feedback.getRequired(data);
      res.json(json);
    } catch (e) {
      next(e);
    }
  };
  getTerms = async (req, res, next) => {
    try {
      const data = {
        //user: req.user,
        user: {
          objectId: "userID",
          __type: "Pointer",
          className: "_User"
        },
        bookingId: req.params.bookingId
      };
      const json = await this.feedback.getTerms(data);
      res.json(json);
    } catch (e) {
      next(e);
    }
  };

  getAverageUserRating = async (req, res, next) => {
    try {
      const data = {
        //user: req.user,
        user: {
          objectId: "userID",
          __type: "Pointer",
          className: "_User"
        }
      };
      const json = await this.feedback.getAverageUserRating(data);
      res.json(json);
    } catch (e) {
      next(e);
    }
  };
}

module.exports = FeedbackController;
