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

export const rand = (min: number, max: number) => {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min) + min);
};
