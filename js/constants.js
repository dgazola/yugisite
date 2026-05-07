const SNAP_SPEED_FACTOR = 0.028;
const SNAP_MIN_DURATION = 0.18;
const SNAP_MAX_DURATION = 0.72;
const SNAP_EASING = 'cubic-bezier(0.22, 0.1, 0.22, 1.0)';
const DRAG_THRESHOLD = 4;
const DEADZONE_X_FACTOR = 0.04;
const DEADZONE_Y_FACTOR = 0.04;
const CURRENT_CARD_WEIGHT = 20;

// Axis lock
const AXIS_LOCK_MIN = 6;          // px of dominance required to lock an axis
const AXIS_SWITCH_THRESHOLD = 35; // perpendicular delta needed to force an axis switch
