import {isCycle, minimize, walk} from '../src/';

const machine = {
	init: {
		type: 'start',
		edges: {
			initialize: {to: 'step1'},
		},
	},
	step1: {
		edges: {
			foo: {to: 'step2'},
		},
	},
	step2: {edges: {bar: {to: 'step3'}, back: {to: 'step1'}}},
	step3: {type: 'terminate'},
};

test('walk', () => {
	expect(walk(machine, ['step1', ['foo']])).toBe('step2');
	expect(walk(machine, ['init', ['initialize', 'foo', 'back']])).toBe('step1');
});

test('isCycle', () => {
	expect(isCycle(machine, ['step1', ['foo', 'back']])).toBe(true);
});

test('isCycle rejects non-cycles', () => {
	//	expect(isCycle(machine, ['step1', ['foo', 'bar']])).toBe(false);
});

test.skip('minimize', () => {
	expect(minimize(machine, ['init', ['initialize', 'foo', 'back']])).toBe([
		'init',
		['initialize', 'foo', 'back'],
	]);
});
