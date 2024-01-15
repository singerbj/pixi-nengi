export const lerp = (current: number, target: number, factor: number) =>
  current * (1 - factor) + target * factor;

export const calculateDistance = (
  x1: number,
  y1: number,
  x2: number,
  y2: number
) => {
  const dx = x2 - x1;
  const dy = y2 - y1;
  return { dist: Math.sqrt(dx * dx + dy * dy), dx, dy };
};

export const getNewPointOnLineWithDistance = (
  originX: number,
  originY: number,
  targetX: number,
  targetY: number,
  distance: number
): [number, number] => {
  let m = (targetY - originY) / (targetX - originX); // slope of the line
  let c = originY - m * originX; // y-intercept of the line

  let x =
    originX +
    (targetX < originX ? -distance : distance) / Math.sqrt(1 + m ** 2); // new x-coordinate
  let y = m * x + c; // new y-coordinate

  return [x, y];
};

export const rand = (min: number, max: number) => {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min) + min);
};
