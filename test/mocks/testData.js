const Formats = require("../../src/lib/formats");
import moment from "moment";

const USER_PTR = {
  objectId: "userID",
  __type: "Pointer",
  className: "_User"
};
const USER_PTR2 = {
  objectId: "userID2",
  __type: "Pointer",
  className: "_User"
};
const COURSE_PTR = {
  objectId: "courseID",
  __type: "Pointer",
  className: "Activity"
};
const INFRA_PTR = {
  objectId: "infraID",
  __type: "Pointer",
  className: "Activity"
};
const PARTNER_PTR = {
  objectId: "partnerID",
  __type: "Pointer",
  className: "Partner"
};
const DATA = {
  _User: {
    userID: { objectId: "userID" },
    userID2: { objectId: "userID2" }
  },
  Activity: {
    courseID: { status: "active", type: "course", objectId: "courseID" },
    infraID: { status: "active", type: "infrastructure", objectId: "infraID" }
  },
  Partner: {
    partnerID: { objectId: "partnerID", name: "partner name" }
  },
  Booking: {
    bookingID1: {
      partner: PARTNER_PTR,
      activity: COURSE_PTR,
      status: "active",
      member: USER_PTR,
      objectId: "bookingID1",
      start: Formats.parseDate(moment().subtract(2, "days"))
    },
    bookingID2: {
      partner: PARTNER_PTR,
      activity: COURSE_PTR,
      status: "active",
      member: USER_PTR,
      objectId: "bookingID2",
      start: Formats.parseDate(moment().subtract(2, "weeks"))
    },
    bookingID3: {
      partner: PARTNER_PTR,
      activity: COURSE_PTR,
      status: "active",
      member: USER_PTR,
      objectId: "bookingID3",
      start: Formats.parseDate(moment().subtract(4, "days")),
      feedback: {
        __type: "Pointer",
        className: "UserFeedback",
        objectId: 'objectId: "feedbackID"'
      }
    },
    bookingID4: {
      partner: PARTNER_PTR,
      activity: COURSE_PTR,
      status: "reservation",
      member: USER_PTR,
      objectId: "bookingID4",
      start: Formats.parseDate(moment().add(1, "week")),
      feedback: {
        __type: "Pointer",
        className: "UserFeedback",
        objectId: 'objectId: "feedbackID2"'
      }
    },
    bookingID5: {
      partner: PARTNER_PTR,
      activity: INFRA_PTR,
      status: "active",
      member: USER_PTR,
      objectId: "bookingID5",
      start: Formats.parseDate(moment().add(2, "days")),
      feedback: {
        __type: "Pointer",
        className: "UserFeedback",
        objectId: 'objectId: "feedbackID3"'
      }
    }
  },
  UserFeedback: {
    feedbackID: {
      objectId: "feedbackID",
      booking: {
        objectId: "bookingID3",
        __type: "Pointer",
        className: "Booking"
      },
      user: USER_PTR,
      comment: "This is a comment",
      value: 3,
      terms: { term1: 3 }
    },
    feedbackID2: {
      objectId: "feedbackID2",
      booking: {
        objectId: "bookingID4",
        __type: "Pointer",
        className: "Booking"
      },
      user: USER_PTR,
      comment: "Second comment",
      value: 4
    },
    feedbackID3: {
      objectId: "feedbackID3",
      booking: {
        objectId: "bookingID5",
        __type: "Pointer",
        className: "Booking"
      },
      user: USER_PTR,
      comment: "Third comment",
      value: 5
    }
  },
  UserFeedbackTerm: {
    feedbackTermID: {
      objectId: "feedbackTermID",
      slug: "term1",
      status: "active",
      type: "course"
    },
    feedbackTermID2: {
      objectId: "feedbackTermID2",
      slug: "term2",
      status: "draft",
      type: "course"
    },
    feedbackTermID3: {
      objectId: "feedbackTermID3",
      slug: "term3",
      status: "active",
      type: "course"
    },
    feedbackTermID4: {
      objectId: "feedbackTermID4",
      slug: "term4",
      status: "active",
      type: "infrastructure"
    },
    feedbackTermID5: {
      objectId: "feedbackTermID5",
      slug: "term5",
      status: "active",
      type: "infrastructure"
    }
  }
};

module.exports = {
  DATA,
  USER_PTR,
  USER_PTR2,
  COURSE_PTR,
  INFRA_PTR,
  PARTNER_PTR
};
