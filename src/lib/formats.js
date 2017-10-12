import type { ParsePtr } from "./parse";

import moment from "moment-timezone";

const PARSE_FORMAT = "YYYY-MM-DDTHH:mm:ss.SSSZ";
const DATE_FORMAT = "DD.MM.YYYY";
const DATE_TIME_FORMAT = "DD.MM.YYYY HH:mm";
const TIME_FORMAT = "HH:mm";
const TZ = "Europe/Vienna";

const PHONE_COUNTRIES = {
  AT: "43",
  CH: "41"
};

const toParsePointer = (className: string, objectId: string): ParsePtr => {
  return {
    __type: "Pointer",
    objectId,
    className
  };
};

const parseDate = function(date, format) {
  if (!date) {
    return null;
  }

  return {
    __type: "Date",
    iso: moment(date, format).format(PARSE_FORMAT) + ""
  };
};

const fromTimezoneToParse = function(datetime, importFormat, zone) {
  /* Using PARSE_FORMAT here might lead to the use of +00:00 which is incorrect for ISO,
     and since parse uses ISO 8601 anyways (http://parseplatform.org/docs/rest/guide/#data-types) we're good. */
  return moment
    .tz(datetime, importFormat, zone)
    .utc()
    .toISOString();
};

const isDateValid = function(date) {
  return moment(date).isValid();
};

const fromParseDate = function(parseDate) {
  if (!parseDate) return parseDate;

  return moment(parseDate.iso || parseDate, PARSE_FORMAT);
};

const isDaytime = function(datetime) {
  if (6 < datetime.hour() && datetime.hour() < 23) {
    return true;
  }
  return false;
};

const toEndOfDayTz = function(parseDate, tz) {
  if (!tz) {
    tz = TZ;
  }

  return fromParseDate(parseDate)
    .tz(TZ)
    .endOf("day");
};

const toDate = function(parseDate) {
  return fromParseDate(parseDate).format(DATE_FORMAT);
};

const toTime = function(parseDate) {
  return fromParseDate(parseDate).format(TIME_FORMAT);
};

const toDateTime = function(parseDate) {
  return fromParseDate(parseDate).format(DATE_TIME_FORMAT);
};

const date = function(date) {
  return moment(date).format(DATE_FORMAT);
};

const time = function(time) {
  return moment(time).format(DATE_TIME_FORMAT);
};

const toTimeTz = function(parseDate, tz) {
  if (!tz) tz = TZ;
  if (!parseDate) {
    return "";
  }

  return fromParseDate(parseDate)
    .tz(tz)
    .format(TIME_FORMAT);
};

const toTimezone = function(parseDate, tz) {
  if (!tz) {
    tz = TZ;
  }
  if (!parseDate) {
    return "";
  }

  return fromParseDate(parseDate).tz(TZ);
};

const toDateTz = function(parseDate, tz) {
  if (!tz) tz = TZ;
  if (!parseDate) {
    return "";
  }

  return fromParseDate(parseDate)
    .tz(tz)
    .format(DATE_FORMAT);
};

const toDateTimeTz = function(parseDate, tz) {
  if (!tz) tz = TZ;
  if (!parseDate) {
    return "";
  }

  return fromParseDate(parseDate)
    .tz(tz)
    .format(DATE_TIME_FORMAT);
};

const decimal = input => {
  input = input || "0";
  input = input.replace(",", ".");
  return Number(input);
};

// Setting date of month with .date(Number) in moment.js bubbles the date if the day doesn't exist in a month (http://momentjs.com/docs/#/get-set/date/)
// This function sets the date to the last day of the month instead of bubbling.
const dateOrLastOfMonth = (date, day) => {
  if (!day || day < 1 || day > 31) {
    return moment.invalid();
  }

  const referenceDate = moment(date);
  const referenceYear = referenceDate.year();
  const referenceMonth = referenceDate.month();

  let saveDayDate = referenceDate.month(referenceMonth).date(day);
  if (saveDayDate.month() != referenceMonth) {
    // if the month has bubbled, set back to the initial month and set day to end of month
    saveDayDate = referenceDate.month(referenceMonth).endOf("month");
  }

  return saveDayDate;
};

// Get the current billing period for a certain membershipDay
const billingPeriod = (
  membershipDay,
  options = {}
): { start: moment$Moment, end: moment$Moment } => {
  let { start, monthOffset } = options;

  let now = start ? moment(start) : moment();
  if (monthOffset) {
    now = moment(now).add(monthOffset, "months");
  }

  membershipDay = membershipDay || 1;
  if (now.date() < membershipDay) {
    // haven't passed the membership day yet, so the billing period began in the last month
    now = now.subtract(1, "month");
  }

  const billingPeriodStart = dateOrLastOfMonth(now, membershipDay).startOf(
    "day"
  );
  const billingPeriodEnd = dateOrLastOfMonth(
    now.add(1, "month"),
    membershipDay
  ).startOf("day");

  return { start: billingPeriodStart, end: billingPeriodEnd };
};

// Get a formatted string for the billing period according to a given day
const formattedBillingPeriod = (day, options) => {
  options = options || {};
  let startDate = options.start;
  let { start, end } = billingPeriod(day, { start: startDate });

  return (
    moment(start).format(DATE_FORMAT) + " - " + moment(end).format(DATE_FORMAT)
  );
};

const isNumeric = n => {
  return !isNaN(parseFloat(n)) && isFinite(n);
};

const priceFormat = (value, valueFunction) => {
  if (!value) {
    value = 0;
  }

  return valueFunction(Number(value));
};

const price = (price, places = 2, trailingZeros = true) => {
  if (!price) {
    price = 0;
  }
  let fixedFormat = Number(Number(price).toFixed(places));
  if ((fixedFormat * 100) % (0.1 * 100) === 0) {
    return fixedFormat.toFixed(2).replace(".", ",");
  }
  return Number(price)
    .toFixed(places)
    .replace(".", ",");
};

const withCurrency = (price, currency) => {
  return currency === "CHF" ? currency + " " + price : price + " " + currency;
};

const priceWithCurrency = (value, currency, rounded) => {
  return withCurrency(price(value, rounded), currency);
};

const leadingZeros = (num, size) => {
  let s = num + "";
  while (s.length < size) s = "0" + s;
  return s;
};

// Sanitize the phone number input to be countryless and in the expected format.
// input …    phone number input that needs to be sanitized
// country …  currently only 'AT' and 'CH' supported
const sanitizePhone = (input, country) => {
  const code = PHONE_COUNTRIES[country];
  if (!country || !code) {
    console.log("Can’t sanitize a phone number without a country.");

    // Country is required
    return "";
  }

  // Remove unnecessary, but valid characters.
  // Read the following regex in the replacement as replacing “this or this”, x | y, with an empty space.
  input = (input + "").replace(/\s|\D/g, "");

  const doubleZeroRegex = new RegExp("^00", "g");
  const countryCodeRegex = new RegExp("^" + code, "g");
  input = input.replace(doubleZeroRegex, "");
  input = input.replace(countryCodeRegex, "0");

  // After the country code replacement, another '00' could have appeared (e.g. 41 (0)77 1111111), so rereun it
  input = input.replace(doubleZeroRegex, "0");
  return input;
};

// Sanitize a phone number and format it for a given country.
const formatPhone = (input, country) => {
  input = sanitizePhone(input, country);
  if (!input) {
    return "";
  }

  if (input.indexOf("0") === 0) {
    input = input.substr(1);
  }

  return "+" + PHONE_COUNTRIES[country] + input;
};

const idMap = entities => {
  const resultMap = new Map();

  let entityResults =
    entities && entities.results ? entities.results : entities;
  for (let e of entityResults) {
    resultMap.set(e.objectId, e);
  }
  return resultMap;
};

// replace nasty characters with unicode according to rule #1 of https://www.owasp.org/index.php/XSS_%28Cross_Site_Scripting%29_Prevention_Cheat_Sheet
const xss = (text: string): string => {
  text = text.replace(/&/g, "＆");
  text = text.replace(/</g, "＜");
  text = text.replace(/>/g, "＞");
  text = text.replace(/"/g, "＂");
  text = text.replace(/'/g, "＇");
  text = text.replace(/\//g, "/");
  return text;
};

module.exports = {
  leadingZeros,
  parseDate,
  fromParseDate,
  toDate,
  toDateTz,
  toDateTime,
  toDateTimeTz,
  toTimeTz,
  toTime,
  toEndOfDayTz,
  isDaytime,
  fromTimezoneToParse,
  toTimezone,
  dateOrLastOfMonth,
  date,
  time,
  price,
  PARSE_FORMAT: PARSE_FORMAT,
  DATE_FORMAT: DATE_FORMAT,
  isNumeric,
  decimal,
  isDateValid,
  sanitizePhone,
  formatPhone,
  billingPeriod,
  formattedBillingPeriod,
  priceWithCurrency,
  idMap,
  xss,
  toParsePointer
};
