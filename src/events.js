const _EventTarget = typeof EventTarget !== 'undefined' ? EventTarget : await (async () => {
	return (await import("event-target-shim")).EventTarget;
})();

const _CustomEvent = typeof CustomEvent !== 'undefined' ? CustomEvent : await (async () => {
	return (await import("event-target-shim")).Event;
})();

export {
	_EventTarget as EventTarget,
	_CustomEvent as CustomEvent,
}
