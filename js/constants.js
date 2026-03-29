/* ============================================================
   MOUNTAIN HEIGHT CONSTANTS
   ── Particle silhouette peaks (mountainProfile gaussians)
      PEAK_*  = height of each gaussian summit
   ── Ridge silhouettes (dark layered shapes behind terrain)
      RIDGE_HEIGHT_BASE  = minimum peak height
      RIDGE_HEIGHT_RANGE = random height added on top of base
      RIDGE_JITTER       = extra midpoint jitter between peaks
   ── Terrain mesh noise amplitude
      TERRAIN_AMP_LARGE  = large-scale rolling hills amplitude
      TERRAIN_AMP_DETAIL = fine-detail noise amplitude
============================================================ */
export const PEAK_DOMINANT = 40.0; // tallest centre peak (particle silhouette)
export const PEAK_RIGHT = 32.0; // secondary peak to the right
export const PEAK_LEFT = 8.0; // secondary peak to the left
export const PEAK_FAR_RIGHT = 4.5; // distant foothill right
export const PEAK_FAR_LEFT = 2.5; // distant foothill left

export const RIDGE_HEIGHT_BASE = 3; // shortest possible ridge peak
export const RIDGE_HEIGHT_RANGE = 12; // random height added on top of base
export const RIDGE_WAVE_AMP1 = 2; // large sine wave variation across each ridge
export const RIDGE_WAVE_AMP2 = 1; // small sine wave variation across each ridge
export const RIDGE_JITTER = 9.0; // midpoint curve jitter between peaks
export const RIDGE_Y_OFFSET = 3; // vertical baseline of the nearest ridge (lower = shorter silhouette)

export const TERRAIN_AMP_LARGE = 2.0; // large rolling waves
export const TERRAIN_AMP_DETAIL = 5.5; // fine surface detail

export const MOON_RADIUS = 5.0; // size of the moon disc
export const MOON_X = 0; // horizontal position (0 = center)
export const MOON_Y = 22; // height above horizon
export const MOON_Z = -28; // depth behind ridges (ridges are at -18, -13, -8)
export const MOON_COLOR = 0xfbf1c7; // warm cream disc
export const MOON_HALO_SCALE = 1.6; // halo size relative to moon radius
export const MOON_ORBIT_RANGE = 38; // how far left/right the moon travels
export const MOON_ORBIT_SPEED = 2; // angular speed — full arc ~every 1 min
/** cos²(phase) peaks when the body crosses the middle of the arc — dip Y into the ridge band */
export const MOON_BEHIND_DIP = 17;
/** tuck slightly farther in Z while "behind" so depth + silhouette line up */
export const MOON_BEHIND_Z_PULL = 8;
export const SUN_COLOR = 0xfabd2f; // warm yellow when toggled to sun

/* ============================================================
   MOUNTAIN PROFILE
   Returns the height (Y) of the ridge silhouette at a given
   world X position. Models a Colorado-style range: one dominant
   peak, two secondaries, two distant foothills.
============================================================ */
export function mountainProfile(x) {
  return (
    PEAK_DOMINANT * Math.exp(-0.5 * Math.pow((x + 1.0) / 5.5, 2)) +
    PEAK_RIGHT * Math.exp(-0.5 * Math.pow((x - 9.5) / 4.0, 2)) +
    PEAK_LEFT * Math.exp(-0.5 * Math.pow((x + 13.0) / 4.5, 2)) +
    PEAK_FAR_RIGHT * Math.exp(-0.5 * Math.pow((x - 19.0) / 3.5, 2)) +
    PEAK_FAR_LEFT * Math.exp(-0.5 * Math.pow((x + 22.0) / 3.5, 2))
  );
}
