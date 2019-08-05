import {sample, normalRandom} from './utils';

type StateName = string;
type TransitionName = string;

type StartTransition<StateT> = {
	to: StateName;
	apply: () => StateT | Promise<StateT>;
};

type Transition<StateT> = {
	to: StateName;
	apply: (state: StateT) => StateT | Promise<StateT>;
};

type StartState<StateT> = {
	type: 'start';
	validate: (state: StateT) => boolean;
	edges: {
		[name in TransitionName]: Transition<StateT> | StartTransition<StateT>;
	};
};

type TerminateState<StateT> = {
	type: 'terminate';
	validate: (state: StateT) => boolean;
	edges: {};
};

type State<StateT> =
	| StartState<StateT>
	| TerminateState<StateT>
	| {
			type?: never;
			validate: (state: StateT) => boolean;
			edges: {[name in TransitionName]: Transition<StateT>};
	  };

type StateMachine<StateT> = {[name in StateName]: State<StateT>};

type Walk = [StateName, TransitionName[]];

export function starts<T>(machine: StateMachine<T>): StateName[] {
	return Object.entries(machine)
		.filter(([, state]) => state.type === 'start')
		.map(([name]) => name);
}

export function randomWalkLength() {
	return Math.max(3, normalRandom(10, 20));
}

export function randomWalk<T>(
	machine: StateMachine<T>,
	length = randomWalkLength(),
): Walk {
	const acc: TransitionName[] = [];
	const start = sample(starts(machine));

	if (!start) {
		throw new Error('State machine has no starting nodes');
	}

	let state: StateName = start;
	for (let i = 0; i < length; ++i) {
		if (machine[state].type === 'terminate') {
			break;
		}

		const nextEdge = sample(Object.entries(machine[state].edges));
		if (!nextEdge) {
			// A state with no edges is an implicit terminate node
			break;
		}
		acc.push(nextEdge[0]);
	}

	return [start, acc];
}

export function* generateWalks<T>(
	machine: StateMachine<T>,
): IterableIterator<Walk> {
	while (1) {
		yield randomWalk(machine);
	}
}

class StateMachineError extends Error {
	/**
	 * The walk that triggered the error.
	 */
	walk: Walk = ['', ['']];
}

export async function runWalk<T>(
	machine: StateMachine<T>,
	walk: Walk,
): Promise<T | null> {
	const [startingState, edges] = walk;
	const log = [];

	// Small `any` hack to satisfy TS without running the initial
	// state twice
	let stateData: T = undefined as any;

	let edge,
		index = 0,
		stateName = startingState;
	try {
		for (edge of edges) {
			const state = machine[stateName];

			// This shouldn't happen, but it convinces TS that we're at a
			// node with at least some valid edges:
			if (state.type === 'terminate') {
				break;
			}

			stateData = await state.edges[edge].apply(stateData);
			const nextStateName = state.edges[edge].to;
			log.push(`${stateName} -> ${nextStateName} via "${edge}"`);

			machine[nextStateName].validate(stateData);
			stateName = nextStateName;

			index++;
		}

		return stateData;
	} catch (e) {
		const newE = new StateMachineError(
			`While at state "${stateName}" and running edge: "${edge}" (index ${index})
In walk from "${startingState}":
${log.join('\n    ')}
Hit error: ${e.message}`,
		);
		newE.walk = [startingState, edges.slice(0, index + 1)];
		newE.stack = e.stack;
		throw newE;
	}
}

export default async function check<T>(
	machine: StateMachine<T>,
): Promise<void> {}
