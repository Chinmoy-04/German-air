// This dashboard's charts only ever plot one point per calendar year
// (Jan 1 of each year), so the library's original month/day formatters
// collapsed every axis label and tooltip title to "Jan 1". Formatting by
// year instead keeps labels meaningful for this yearly-granularity data.
export const shortDateFmt = new Intl.DateTimeFormat("en-US", {
  year: "numeric",
});

export const weekdayDateFmt = new Intl.DateTimeFormat("en-US", {
  year: "numeric",
});

export const hmsTimeFmt = new Intl.DateTimeFormat("en-US", {
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
  hour12: false,
});

// `Intl.NumberFormat.prototype.format` is a bound getter — safe to extract.
export const intFmt = new Intl.NumberFormat("en-US").format;
