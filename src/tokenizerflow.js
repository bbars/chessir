const tokenizerflow = await (async function () {
	try {
		return (await import('tokenizerflow'));
	}
	catch {
		return (await import('https://unpkg.com/tokenizerflow@latest/index.js'));
	}
})();

export default tokenizerflow;
