// npm i alarm sfx
const alarm = require('alarm')
const sfx = require('sfx')

// npm i moment @types/moment
import * as moment from 'moment'
// 24 hours format 
const FORMAT_DATE = 'M/D/Y H:mm:ss'

// 12 hours format 
// const FORMAT_DATE = 'M/D/Y hh:mm:ss'

// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
		console.log('Congratulations, your extension "sfnodeschool" is now active!');

	// The command has been defined in the package.json file
	// Now provide the implementation of the command with registerCommand
	// The commandId parameter must match the command field in package.json
	// let disposable = vscode.commands.registerCommand('extension.helloWorld', () => {
	// 	// The code you place here will be executed ever-y time your command is executed

	// 	// Display a message box to the user
	// 	vscode.window.showInformationMessage('Hello World!');
	// });
	const reminderManager = new ReminderManager()
	// to this function works we need to change
	// on package.json onActivateCommand to * 
	reminderManager.createStatusBar()

	const command = 'extension.newReminder'
	let reminderCommand = vscode
								.commands
		.registerCommand(command, async () => {
			const reminderName = 
				await reminderManager
					.showPrompt('Put your reminder!!',
								'',
								'Name!')
			if(!reminderName) {
				vscode.window.showErrorMessage(
					'you must put a name!'
				)
				return;
			}

			const defaultDate = 
				moment()
				.add(10, 'seconds')
				.format(FORMAT_DATE)
			
			const reminderDate = await 
				reminderManager.showPrompt(
					'Insert datetime',
					defaultDate,
					FORMAT_DATE
				)
			const momentDate = 
				moment(reminderDate, FORMAT_DATE)
			
			if(!momentDate.isValid()) {
				vscode.window.showErrorMessage(
					'You must use a valid date!'
				)
				return;
			}

			reminderManager.configureAlarm(
				{
					date: momentDate,
					text: reminderName
				}
			)

		})
	

	context.subscriptions.push(reminderCommand);
}

// this method is called when your extension is deactivated
export function deactivate() {}


// 
class ReminderManager {
	configureAlarm(data) {
		const when = data.date.toDate()
		alarm(when, () => {
			sfx.ping()
			vscode.window
				.showInformationMessage(
					`Reminder: ${data.text}`
				)
		})
	}

	showPrompt(text, defaultValue, placeHolder) {
		
		return vscode.window.showInputBox({
			placeHolder, 
			value: defaultValue,
			prompt: text
		})
	} 

	createStatusBar() {
		const icon = '🍅'
		const statusBar = 
			vscode.window
					.createStatusBarItem
						(
							vscode.
								StatusBarAlignment
								.Right	
						)
		statusBar.text = icon
		statusBar.command = "extension.newReminder"
		statusBar.tooltip = "Create a new reminder"
		statusBar.show()
	}
}