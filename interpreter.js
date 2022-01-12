import * as fs from 'fs'
import {RuntimeError, StackTrace, Yard, rpn, ParseTrace} from "./util.js"

function pushdata(id, value) {
	let data = JSON.parse(fs.readFileSync('./memory.json').toString())
	data[id] = value
	let err = fs.writeFileSync('./memory.json', JSON.stringify(data))
	if (err) console.log(err)
}

const RuntimeStack = new StackTrace()

export default function Interpret(AST) {
	RuntimeStack.push("Program Start", 0)
	let tokens = AST.body
	let current = 0
	let line = 1
	let ans = null
	AST.body.forEach(element => {
		switch(element.type) {
			case 'newline':
				current += 1
				line += 1
				break;
			case 'eopen':
			case 'bopen':
			case 'sopen':
				RuntimeStack.push("Brackets", line)
				current += 1
				break;
			case 'eclose':
			case 'bclose':
			case 'sclose':
				RuntimeStack.pop()
			case 'memory':
				if (element.kind === 'mset') {
					RuntimeStack.push("mset", line)
					current += 1
					pushdata(element.declarations.id.name, element.declarations.init.value)
					ans = element.declarations.init.value
					RuntimeStack.pop()
					return;
				}
				if (element.kind === 'var') {
					RuntimeStack.push("var", line)
					let id = element.declarations.id.name
					let raw = fs.readFileSync('./memory.json').toString()
					let data = JSON.parse(raw)
					ans = parseFloat(data[id])
					if (!ans && ans !== 0) ans = data[id]
					if (!ans) throw new RuntimeError("NotDefined", `${id} is not declared`, line, ParseTrace(RuntimeStack))
					current += 1
					console.log(ans)
					RuntimeStack.pop()
					return
					
					
				}
				break;
			case 'block':
				RuntimeStack.push("Equation", line)
				let op = []
				element.body.forEach(e => {
					op.push(e.value)
				})
				ans = rpn(Yard(op), line)
				RuntimeStack.pop()
				return console.log(ans)
			default:
				current += 1
		}
	})
}
