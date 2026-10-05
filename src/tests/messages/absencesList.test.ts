import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { formatAbsencesList } from "../../messages/absencesList";
import type { AbsenceWithName } from "../../types/db";
import { safeName } from "../../utils/safeName";

function absence(name: string, startDate: string, endDate: string): AbsenceWithName {
    return { tag: `#${name}`, name, startDate, endDate };
}

describe("formatAbsencesList", () => {
    it("says that nobody is absent when the list is empty", () => {
        const message = formatAbsencesList([]);

        assert.ok(message.includes("Aucun absent"));
    });

    it("writes one line per absence with French dates", () => {
        const message = formatAbsencesList([
            absence("Alice", "2026-10-05", "2026-10-11"),
            absence("Bob", "2026-10-06", "2026-10-08"),
        ]);
        const lines = message.split("\n").filter((line) => line.startsWith("•"));

        assert.equal(lines.length, 2);
        assert.ok(lines[0].includes(`**${safeName("Alice")}** - Du 05-10-2026 au 11-10-2026`));
        assert.ok(lines[1].includes(`**${safeName("Bob")}** - Du 06-10-2026 au 08-10-2026`));
    });
});
