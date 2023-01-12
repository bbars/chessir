import Storage from './Storage.js';
import assert from 'assert';

// prepare:
let lastUpdate = null;
const checkLast = (name, newValue, oldValue) => {
	assert(lastUpdate.name === name, `Wrong name`);
	assert(lastUpdate.newValue === newValue, `Wrong newValue`);
	assert(lastUpdate.oldValue === oldValue, `Wrong oldValue`);
}
const storage = new Storage((name, newValue, oldValue) => {
	lastUpdate = { name, newValue, oldValue };
}, String);

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
	{
		name: 'bool',
		setValue: false,
		expectNewValue: 'false',
		expectOldValue: 'true',
	},
];

for (const { name, setValue, expectNewValue, expectOldValue } of changes) {
	it(`Storage set value [${name}] = ${JSON.stringify(setValue)}`, () => {
		storage[name] = setValue;
		checkLast(name, expectNewValue, expectOldValue);
	});
}
