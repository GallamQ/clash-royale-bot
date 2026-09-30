export function toFrenchDate(isoDate: string): string {
    return isoDate.split("-").reverse().join("-");
}
