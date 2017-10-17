const ACL = require("../auth/ACL");
const Formats = require("../lib/formats");
const moment = require("moment");
import ApiError from "../lib/apiError";

const CLASS_NAME = "UserFeedback";
const TERM_CLASS_NAME = "UserFeedbackTerm";

const ERRORS = {
  ERROR: { code: 25000, message: "feedback error" },
  USER_REQUIRED: { code: 25001, message: "user is required" },
  BOOKING_REQUIRED: { code: 25002, message: "booking id is required" },
  FEEDBACK_ALREADY_PROVIDED: {
    code: 25003,
    message: "feedback has already been provided"
  },
  VALUE_REQUIRED: { code: 25004, message: "value is required" },
  BOOKING_NOT_FOUND: { code: 25005, message: "booking  not found" },
  NO_FEEDBACKS_PROVIDED_YET: {
    code: 25006,
    message: "user has no feedbacks yet"
  },
  NO_FEEDBACKS_WITH_VALUES: {
    code: 25007,
    message: "user did not provide feedback values yet"
  }
};

class FeedbackService {
  constructor(options) {
    this.auth = options.auth;
    this.dataStore = options.dataStore;
  }
  submit = async options => {
    return submit(this.dataStore, options);
  };
  getTerms = async options => {
    return getTerms(this.dataStore, options);
  };
  getRequired = async options => {
    return getRequired(this.dataStore, options);
  };
  getAverageUserRating = async options => {
    return getAverageUserRating(this.dataStore, options);
  };
}

/*

    get all active bookings without feedback

*/

const getLastBooking = async (dataStore, { user }) => {
  const userPtr = {
    __type: "Pointer",
    className: "_User",
    objectId: user.objectId
  };
  const query = {
    member: userPtr,
    status: "active",
    // this is not ideal but since some bookings don't have end time there is no better way
    start: { $lt: Formats.parseDate(moment().subtract(2, "hours")) }
  };
  const { results } = await dataStore.query(
    { type: "Booking", order: "-start", limit: 1, include: "partner,activity" },
    query
  );
  return results[0];
};
/*
  connect booking and feedback via pointers
*/
const connectBooking = async (dataStore, { feedback, bookingId }) => {
  const feedbackPtr = {
    __type: "Pointer",
    className: CLASS_NAME,
    objectId: feedback.objectId
  };
  const booking = await dataStore.getOne("Booking", bookingId);
  booking.feedback = feedbackPtr;

  const res = await dataStore.save("Booking", booking);

  return booking;
};
/*
  get bookings for which the user needs to provide feedback
*/
const getRequired = async (dataStore, { user }) => {
  const booking = await getLastBooking(dataStore, { user });
  if (!booking || booking.feedback) {
    return [];
  }
  return [booking];
};

const submit = async (
  dataStore,
  { user, bookingId, terms, source, comment, value }
) => {
  const feedback = await create(dataStore, {
    user,
    bookingId,
    terms,
    source,
    comment,
    value
  });
  const booking = await connectBooking(dataStore, { feedback, bookingId });

  return feedback;
};
/*
  should cap the value to a number between 0 - 5
*/
const capValue = value => {
  return Math.max(0, Math.min(5, Number(value)));
};
/*
  ensure only valid terms can be supplied
*/
const sanitizeTerms = async (dataStore, { terms, user, bookingId }) => {
  const activeTerms = await getTerms(dataStore, { user, bookingId });
  let validTerms = {};
  for (let key in terms) {
    let active = null;
    for (let i in activeTerms) {
      if (key === activeTerms[i].slug) {
        active = activeTerms[i];
      }
    }
    if (active) {
      validTerms[key] = capValue(terms[key]);
    }
  }
  return validTerms;
};
/*
  create a new feedback
*/
const create = async (
  dataStore,
  { user, bookingId, terms, source, comment, value }
) => {
  if (!user) {
    throw new ApiError(ERRORS.USER_REQUIRED);
  }
  if (!bookingId) {
    throw new ApiError(ERRORS.BOOKING_REQUIRED);
  }
  if (isNaN(value)) {
    throw new ApiError(ERRORS.VALUE_REQUIRED);
  }

  const validTerms = await sanitizeTerms(dataStore, { terms, user, bookingId });
  const capedValue = capValue(value);
  const userPtr = {
    __type: "Pointer",
    className: "_User",
    objectId: user.objectId
  };
  const bookingPtr = {
    __type: "Pointer",
    className: "Booking",
    objectId: bookingId
  };
  const query = {
    user: userPtr,
    booking: bookingPtr
  };

  let [member, feedback] = await Promise.all([
    dataStore.getOne("_User", user.objectId),
    dataStore.query({ type: CLASS_NAME }, query)
  ]);
  if (feedback && feedback.results.length > 0) {
    throw new ApiError(ERRORS.FEEDBACK_ALREADY_PROVIDED);
  }

  const acl = ACL.createAdminACL();

  feedback = {
    user: userPtr,
    booking: bookingPtr,
    acl,
    value: capedValue,
    terms: validTerms,
    source,
    comment
  };
  feedback = await save(dataStore, feedback);

  return feedback;
};

/*
    Refactored to use datastore.getOne with the activity include
*/
const getBooking = async (dataStore, bookingId) => {
  const result = await dataStore.getOne("Booking", {
    objectId: bookingId,
    include: "activity"
  });
  return result;
};

/*
    get all active terms terms for a booking
*/
const getTerms = async (dataStore, { user, bookingId }) => {
  const booking = await getBooking(dataStore, bookingId);
  if (!booking) {
    throw new ApiError(ERRORS.BOOKING_NOT_FOUND);
  }
  const type = booking.activity.type;
  const { results } = await dataStore.query(
    { type: TERM_CLASS_NAME },
    { status: "active", type }
  );
  return results;
};

const save = async (dataStore, feedback) => {
  const res = await dataStore.save(CLASS_NAME, feedback);
  feedback.objectId = res.objectId;
  return feedback;
};

const getAverageUserRating = async (dataStore, userID) => {
  const userPtr = {
    __type: "Pointer",
    className: "_User",
    objectId: userID.objectId
  };

  let user = await dataStore.getOne("_User", userID.user.objectId);

  const { results } = await dataStore.query(
    { type: CLASS_NAME, include: "user" },
    { user: user }
  );

  if (!results || results.length == 0) {
    throw new ApiError(ERRORS.NO_FEEDBACKS_PROVIDED_YET);
  }

  let totalValues = 0;
  let feedbacksWithValues = 0;
  results.forEach(feedback => {
    if (feedback.value) {
      console.log("Found feedback value:", feedback.value);
      feedbacksWithValues++;
      totalValues += feedback.value;
    }
  });

  if (feedbacksWithValues === 0) {
    throw new ApiError(ERRORS.NO_FEEDBACKS_WITH_VALUES);
  }
  let average = totalValues / feedbacksWithValues;
  console.log("TOTAL =", totalValues);
  console.log("Average = ", average);

  return {
    user: userID.user.objectId,
    totalFeedbacks: feedbacksWithValues,
    average
  };
};

module.exports = {
  FeedbackService,
  getTerms,
  sanitizeTerms,
  capValue,
  submit,
  getRequired,
  create,
  capValue,
  ERRORS
};
