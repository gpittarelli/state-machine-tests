export function random(min = 0, max = 1) {
	return Math.floor(min + Math.random() * max);
}

// https://stackoverflow.com/a/36481059/922613
// Standard Normal variate using Box-Muller transform.
//
// Note that min and max specify the bounds of the first standard
// deviation -- actual output is unbounded
export function normalRandom(min = -1, max = 1) {
	let u = 0,
		v = 0;
	while (u === 0) u = Math.random(); //Converting [0,1) to (0,1)
	while (v === 0) v = Math.random();
	const x = Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);

	const mean = (max + min) / 2;
	const sd = (max - min) / 2;
	return Math.sqrt(sd) * x + mean;
}

export function sample<T>(items: T[]): T | undefined {
	return items[random(0, items.length)];
}

export function* take<T>(items: Iterator<T>, n: number): IterableIterator<T> {
	let it = items.next();
	for (let i = 0; i < n && !it.done; ++i) {
		yield it.value;
		it = items.next();
	}
}

export function* map<A, B>(
	items: Iterator<A>,
	f: (a: A) => B,
): IterableIterator<B> {
	let it = items.next();
	while (!it.done) {
		yield f(it.value);
		it = items.next();
	}
}

export function* filter<T>(
	items: Iterator<T>,
	f: (x: T) => boolean,
): IterableIterator<T> {
	let it = items.next();
	while (!it.done) {
		if (f(it.value)) {
			yield it.value;
		}
		it = items.next();
	}
}

export function reduce<T, S>(
	items: Iterator<T>,
	f: (s: S, x: T) => S,
  state: S,
): S {
	let it = items.next();
	while (!it.done) {
		state = f(state, it.value);
		it = items.next();
	}
  return state;
}

export function min<T>(
	items: Iterator<T>,
	f: (a: T, b: T) => T,
): T {
  const it = items.next();
  return reduce(items, (a, b) => {
    return f(a, b);
  }, it.value);
}

export function throws(fn: (...a: any[]) => any): boolean {
  try {
    fn();
    return true;
  } catch (e) {
    return false;
  }
}

/**
 * The complement of Array.prototype.slice: removes the slices and
 * returns everything else.
 */
export function removeSlice<T>(arr: T[], start: number, end: number) {
	return [...arr.slice(0, start), ...arr.slice(end, arr.length)];
}
