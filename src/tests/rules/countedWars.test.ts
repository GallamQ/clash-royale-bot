import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { FIRST_COUNTED_WAR_DATE, filterCountedWars } from "../../rules/countedWars";
import type { WarHistoryEntry } from "../../rules/jokers";

function buildWar(startDate: string): WarHistoryEntry {
    return { startDate, results: [] };
}

describe("filterCountedWars", () => {
    it("starts counting wars on 2026-10-22", () => {
        assert.equal(FIRST_COUNTED_WAR_DATE, "2026-10-22");
    });

    it("ignores wars before the first counted war", () => {
        const wars = [buildWar("2026-10-08"), buildWar("2026-10-15")];

        assert.deepEqual(filterCountedWars(wars), []);
    });

    it("keeps the war that starts exactly on the first counted date", () => {
        const wars = [buildWar("2026-10-22")];

        assert.deepEqual(filterCountedWars(wars), wars);
    });

    it("keeps later wars and drops earlier ones, in the same order", () => {
        const wars = [
            buildWar("2026-10-08"),
            buildWar("2026-10-15"),
            buildWar("2026-10-22"),
            buildWar("2026-10-29"),
        ];

        assert.deepEqual(filterCountedWars(wars), [buildWar("2026-10-22"), buildWar("2026-10-29")]);
    });

    it("handles a date in a later year", () => {
        const wars = [buildWar("2027-01-07")];

        assert.deepEqual(filterCountedWars(wars), wars);
    });

    it("returns an empty list for an empty history", () => {
        assert.deepEqual(filterCountedWars([]), []);
    });
});
