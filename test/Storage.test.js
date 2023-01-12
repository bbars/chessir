import Storage from '../src/utils/Storage.js';

// prepare:
let lastUpdate = null;
const checkLast = (name, newValue, oldValue) => {
	console.assert(lastUpdate.name === name, `Wrong name`);
	console.assert(lastUpdate.newValue === newValue, `Wrong newValue`);
	console.assert(lastUpdate.oldValue === oldValue, `Wrong oldValue`);
}
const storage = new Storage((name, newValue, oldValue) => {
	lastUpdate = { name, newValue, oldValue };
});

// tests:
const changes = [
	{
		name: 'one',
		setValue: 'One',
		expectNewValue: 'One',
		expectOldValue: undefined,
	},
	{
		name: 'one',
		setValue: '1',
		expectNewValue: '1',
		expectOldValue: 'One',
	},
	{
		name: 'two',
		setValue: 2,
		expectNewValue: '2',
		expectOldValue: undefined,
	},
	{
		name: 'bool',
		setValue: true,
		expectNewValue: 'true',
		expectOldValue: undefined,
	},
];

for (const { name, setValue, expectNewValue, expectOldValue } of changes) {
	it(`Storage set value [${name}] = ${JSON.stringify(setValue)}`, () => {
		storage[name] = setValue;
		checkLast(name, expectNewValue, expectOldValue);
	});
}
