import {cycles, isCycle, minimize, reductions, end} from '../src/';

const machine = {
	init: {type: 'start', edges: {initialize: {to: 'step1'}}},
	step1: {edges: {foo: {to: 'step2'}}},
	step2: {edges: {bar: {to: 'step3'}, back: {to: 'step1'}}},
	step3: {type: 'terminate'},
};

test('end', () => {
	expect(end(machine, ['step1', ['foo']])).toBe('step2');
	expect(end(machine, ['init', ['initialize', 'foo', 'back']])).toBe('step1');
	expect(end(machine, ['init', ['initialize', 'foo', 'bar']])).toBe('step3');
});

test('isCycle', () => {
	expect(isCycle(machine, ['step1', ['foo', 'back']])).toBe(true);
});

test('isCycle rejects non-cycles', () => {
	expect(isCycle(machine, ['step1', ['foo', 'bar']])).toBe(false);
});

test('cycles', () => {
	expect(
		Array.from(cycles(machine, ['init', ['initialize', 'foo', 'bar']])),
	).toStrictEqual([]);
	expect(
		Array.from(cycles(machine, ['step1', ['foo', 'back', 'foo']])),
	).toStrictEqual([[0, 2], [1, 3]]);
});

test('reductions', () => {
	expect(
		Array.from(reductions(machine, ['init', ['initialize', 'foo', 'bar']])),
	).toStrictEqual([]);
	expect(
		Array.from(reductions(machine, ['step1', ['foo', 'back', 'foo', 'bar']])),
	).toStrictEqual([['step1', ['foo', 'bar']], ['step1', ['foo', 'bar']]]);
});

test.skip('minimize', () => {
	expect(minimize(machine, ['init', ['initialize', 'foo', 'back']])).toBe([
		'init',
		['initialize', 'foo', 'back'],
	]);
});
