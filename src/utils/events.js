const _EventTarget = typeof EventTarget !== 'undefined' ? EventTarget : await (async () => {
	return (await import("event-target-shim")).EventTarget;
})();

const _Event = typeof Event !== 'undefined' ? Event : await (async () => {
	return (await import("event-target-shim")).Event;
})();

const _CustomEvent = typeof CustomEvent !== 'undefined' ? CustomEvent : class CustomEvent extends Event {
	constructor(eventType, props) {
		super(eventType, props);
		if (props && props.detail) {
			this.detail = props.detail;
		}
	}
};

export {
	_EventTarget as EventTarget,
	_Event as Event,
	_CustomEvent as CustomEvent,
}
