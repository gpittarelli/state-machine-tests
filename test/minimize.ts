import check, {
	StateMachine,
	cycles,
	isCycle,
	minimize,
	reductions,
	end,
} from '../src/';

const machine: StateMachine<void> = {
	step0: {
		type: 'start',
		edges: {init: {to: 'step1', apply: () => {}}},
	},
	step1: {
		validate: () => {},
		edges: {foo: {to: 'step2', apply: () => {}}},
	},
	step2: {
		validate: () => {},
		edges: {
			bar: {to: 'step3', apply: () => {}},
			back: {to: 'step1', apply: () => {}},
		},
	},
	step3: {type: 'terminate', validate: () => {}},
};

const machineThatFails: StateMachine<number> = {
	step0: {
		type: 'start',
		edges: {init: {to: 'step1', apply: () => 1}},
	},
	step1: {
		validate: (s: number) => {
			if (s >= 3) {
				throw new Error('step1 fail');
			}
		},
		edges: {foo: {to: 'step2', apply: (s: number) => s + 1}},
	},
	step2: {
		validate: () => {},
		edges: {
			bar: {to: 'step3', apply: (s: number) => s},
			back: {to: 'step1', apply: (s: number) => s},
		},
	},
	step3: {type: 'terminate', validate: () => {}},
};

test('end', () => {
	expect(end(machine, ['step1', ['foo']])).toBe('step2');
	expect(end(machine, ['step0', ['init', 'foo', 'back']])).toBe('step1');
	expect(end(machine, ['step0', ['init', 'foo', 'bar']])).toBe('step3');
});

test('isCycle', () => {
	expect(isCycle(machine, ['step1', ['foo', 'back']])).toBe(true);
});

test('isCycle rejects non-cycles', () => {
	expect(isCycle(machine, ['step1', ['foo', 'bar']])).toBe(false);
});

test('cycles', () => {
	expect(
		Array.from(cycles(machine, ['step0', ['init', 'foo', 'bar']])),
	).toStrictEqual([]);
	expect(
		Array.from(cycles(machine, ['step1', ['foo', 'back', 'foo']])),
	).toStrictEqual([[0, 2], [1, 3]]);
});

test('reductions', () => {
	expect(
		Array.from(reductions(machine, ['step0', ['init', 'foo', 'bar']])),
	).toStrictEqual([]);
	expect(
		Array.from(reductions(machine, ['step1', ['foo', 'back', 'foo', 'bar']])),
	).toStrictEqual([['step1', ['foo', 'bar']], ['step1', ['foo', 'bar']]]);
});

test('minimize', async () => {
	const fakeError = new Error();

	await expect(
		minimize(machine, ['step0', ['init', 'foo', 'back']], fakeError),
	).rejects.toBe(fakeError);

	await expect(
		minimize(
			machineThatFails,
			[
				'step0',
				[
					'init',
					'foo',
					'back',
					'foo',
					'back',
					'foo',
					'back',
					'foo',
					'back',
					'foo',
					'back',
				],
			],
			fakeError,
		),
	).rejects.toMatchObject({
		walk: ['step0', ['init', 'foo', 'back', 'foo', 'back']],
	});
});

test('check', async () => {
	await expect(check(machineThatFails)).rejects.toMatchObject({
		walk: ['step0', ['init', 'foo', 'back', 'foo', 'back']],
	});
});
