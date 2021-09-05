/**
 * Determines if the given lookups are equal, only compairing the id, name, and entityType
 * @param lookup1 Lookup 1
 * @param lookup2 Lookup 2
 * @returns true if both are equal
 */
export function areEqualLookup(lookup1: XdtXrm.Lookup, lookup2: XdtXrm.Lookup): boolean {
    // Are exactly same or both falsey
    if (lookup1 === lookup2 || (!lookup1 && !lookup2)) {
        return true;
    }
    // Only on is falsey
    if (!lookup1 || !lookup2) {
        return false;
    }

    return lookup1.id === lookup2.id && lookup1.entityType === lookup2.entityType && lookup1.name === lookup2.name;
}

/**
 * Determines if the given arrays of lookup values are equal, only compairing the id, name, and entityType.
 * @param lookups1 First set of values
 * @param lookups2 Second set of values
 * @returns true if both are equal
 */
export function areEqualLookupArray(lookups1: XdtXrm.Lookup[], lookups2: XdtXrm.Lookup[]): boolean {
    // Are exactly same or both falsey
    if (lookups1 === lookups2 || (!lookups1 && !lookups2)) {
        return true;
    }
    // Only one is falsey or length not equal
    if (!lookups1 || !lookups2 || lookups1.length !== lookups2.length) {
        return false;
    }

    return lookups1.every((v, i) => areEqualLookup(v, lookups2[i]));
}

/**
 * Determines if two arrays are equal (including index order of items).  Useful for determining if a MultiChoice attribute value has changed.
 * @param array1 First array
 * @param array2 Second Array
 * @returns true if both are equal
 */
export function areEqualArray(array1: [], array2: []): boolean {
    // Are exactly same or both falsey
    if (array1 === array2 || (!array1 && !array2)) {
        return true;
    }
    // Only one is falsey or length not equal
    if (!array1 || !array2 || array1.length !== array2.length) {
        return false;
    }

    return array1.every((v, i) => v === array2[i]);
}
