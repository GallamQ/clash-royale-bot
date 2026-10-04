import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { resolveAbsenceDates } from "../../rules/absenceDates";
import { UserError } from "../../utils/userError";

describe("resolveAbsenceDates without explicit dates", () => {
    it("returns the current week from Monday to Sunday", () => {
        const dates = resolveAbsenceDates(undefined, undefined, "2026-09-29");

        assert.deepEqual(dates, { startDate: "2026-09-28", endDate: "2026-10-04" });
    });

    it("keeps the same week when today is a Monday", () => {
        const dates = resolveAbsenceDates(undefined, undefined, "2026-09-28");

        assert.deepEqual(dates, { startDate: "2026-09-28", endDate: "2026-10-04" });
    });

    it("keeps the same week when today is a Sunday", () => {
        const dates = resolveAbsenceDates(undefined, undefined, "2026-10-04");

        assert.deepEqual(dates, { startDate: "2026-09-28", endDate: "2026-10-04" });
    });

    it("crosses a year boundary", () => {
        const dates = resolveAbsenceDates(undefined, undefined, "2026-12-31");

        assert.deepEqual(dates, { startDate: "2026-12-28", endDate: "2027-01-03" });
    });
});

describe("resolveAbsenceDates with explicit dates", () => {
    it("converts French dates to ISO dates", () => {
        const dates = resolveAbsenceDates("05-10-2026", "11-10-2026", "2026-09-29");

        assert.deepEqual(dates, { startDate: "2026-10-05", endDate: "2026-10-11" });
    });

    it("accepts a one-day absence", () => {
        const dates = resolveAbsenceDates("05-10-2026", "05-10-2026", "2026-09-29");

        assert.deepEqual(dates, { startDate: "2026-10-05", endDate: "2026-10-05" });
    });

    it("accepts February 29 on a leap year", () => {
        const dates = resolveAbsenceDates("29-02-2028", "29-02-2028", "2028-02-01");

        assert.deepEqual(dates, { startDate: "2028-02-29", endDate: "2028-02-29" });
    });

    it("rejects February 29 on a regular year", () => {
        assert.throws(
            () => resolveAbsenceDates("29-02-2027", "01-03-2027", "2027-02-01"),
            UserError,
        );
    });

    it("rejects a date that does not exist", () => {
        assert.throws(
            () => resolveAbsenceDates("31-02-2026", "05-03-2026", "2026-09-29"),
            UserError,
        );
    });

    it("rejects an end date before the start date", () => {
        assert.throws(
            () => resolveAbsenceDates("11-10-2026", "05-10-2026", "2026-09-29"),
            UserError,
        );
    });

    it("rejects an ISO formatted date", () => {
        assert.throws(
            () => resolveAbsenceDates("2026-10-05", "2026-10-11", "2026-09-29"),
            UserError,
        );
    });
});
