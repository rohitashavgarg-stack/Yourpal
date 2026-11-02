// When does the app ask "When did you eat?" while a food is checked on the Diet plan page?
// Only when the member is probably not eating it right now. A meal counts as "on time" from an hour before its planned time to an hour and
// a half after it. Inside that window the meal is logged at the current time without a question. Outside it (breakfast ticked at 11 am,
// or lunch ticked at 9 am) the app asks once, on the first food of that meal.
const EARLY = 60;
const LATE = 90;

/** True when `now` is far from the meal's planned time. Both are minutes since midnight. */
export const isOffTime = (planned: number, now: number) => now < planned - EARLY || now > planned + LATE;

/** The time to suggest when asking: a late log suggests the meal's own time, an early one suggests now. */
export const suggestAt = (planned: number, now: number) => (now > planned + LATE ? planned : now);
