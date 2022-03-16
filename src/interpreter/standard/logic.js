import {RuntimeError, ParseTrace} from '../../util.js'

export default function (args, line, trace) {
	try {
		let statement = args.join(' ')
		if (Function(`
	if (${statement}) return true
`)) {
			return "Logic " + statement + " returned True"
		} else {
			return "Logic " + statement + " returned False"
		}
	} catch(err) {
		console.log(err)
		throw new RuntimeError("StandardLibraryLogic", "An error occured during evaluation of logic", line, ParseTrace(trace))
	}
}