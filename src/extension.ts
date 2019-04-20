// npm i moment alarm
'use strict';
import * as vscode from 'vscode';
import * as moment from 'moment';
const alarm = require('alarm');
var sfx = require("sfx");

const FORMAT_DATE = `M/D/Y H:mm:ss`;

export function activate(context: vscode.ExtensionContext) {
  const taskManager = new TaskManager();
  taskManager.createStatusBar();

// --------
  let getTasks = vscode.commands.registerCommand(
    'extension.getTasks',
    async () => {
      const messages = taskManager
        .getTask()
        .map(({ reminderName, date }) => `${reminderName} - ${date.format(FORMAT_DATE)}`)
        .join('\n');

      vscode.window.showInformationMessage(messages);
    },
  );

// --------
  let createTask = vscode.commands.registerCommand(
    'extension.createTask',
    async () => {
      const reminderName = await taskManager.promptMessage(
        'Insert your reminder name',
        'My reminder name',
      );

      if (!reminderName) {
        vscode.window.showErrorMessage('It must have a name! canceling...');
        return;
      }

      const defaultDate = moment()
        .add(10, 'seconds')
        .format(FORMAT_DATE);

      const date = await taskManager.promptMessage(
        'Insert the date!',
        FORMAT_DATE,
        defaultDate,
      );

      const momentDate = moment(date, FORMAT_DATE);

      if (!momentDate.isValid()) {
        vscode.window.showErrorMessage(
          'It must have a valid date! canceling...',
        );
        return;
      }

      taskManager.setTask({ date: momentDate, reminderName });
    },
  );

  context.subscriptions.push(createTask, getTasks);
}

export function deactivate() {}


// -----------
interface Reminder {
   date: moment.Moment
  reminderName: string
}
class TaskManager {
  
  private _tasks: Reminder[] = [];
  private statusBarText: vscode.StatusBarItem;

  setTask(data: Reminder): void {
    this._tasks.push(data);
    this.configureAlarm(data.reminderName, data.date);
  }

  getTask(): Reminder[] {
    return this._tasks;
  }

  promptMessage(prompt: string, placeHolder: string, value: string = '') {
    return vscode.window.showInputBox({
      prompt,
      placeHolder,
      value,
    });
  }
  createStatusBar(): void {
    const icon = '🍅';
    this.statusBarText = vscode.window.createStatusBarItem(
      vscode.StatusBarAlignment.Right,
    );
    this.statusBarText.text = icon;
    this.statusBarText.command = 'extension.getTasks';
    this.statusBarText.tooltip = 'Show all reminders';
    this.statusBarText.show();
  }

  configureAlarm(text: string, time: moment.Moment): void {
    const timeMilliseconds = time.toDate();

    alarm(timeMilliseconds, () => {
      sfx.ping();
      vscode.window.showInformationMessage(`Reminder: ${text}`);

    });
  }
}
