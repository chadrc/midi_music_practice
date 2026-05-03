import {Stave} from "vexflow";

export const STAFF_NOTATION_METER = "4/4";

/** Room after clef + time signature before the first note enters the bar. */
export const STAVE_LEADING_RESERVE_PX = 88;
/** Space after the last note / stem before the end of the staff lines. */
export const STAVE_TRAILING_RESERVE_PX = 44;
/**
 * Extra width beyond tight content so {@link System} justification spreads notes horizontally
 * (more space between beats, and slack that becomes margin at both ends of the bar).
 */
export const STAVE_JUSTIFY_EXTRA_PX = 100;
/** Horizontal room for a key signature (_formatter width excludes stave modifiers). */
export const STAVE_KEY_SIGNATURE_RESERVE_PX = 96;

export function minStaveWidthPx(
    minTickWidth: number,
    options?: {withKeySignature?: boolean},
): number {
    const keyExtra = options?.withKeySignature ? STAVE_KEY_SIGNATURE_RESERVE_PX : 0;
    return Math.ceil(
        minTickWidth +
          Stave.rightPadding +
          STAVE_LEADING_RESERVE_PX +
          STAVE_TRAILING_RESERVE_PX +
          STAVE_JUSTIFY_EXTRA_PX +
          keyExtra,
    );
}
