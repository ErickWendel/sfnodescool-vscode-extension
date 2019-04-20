// npm i moment alarm
'use strict';
import * as vscode from 'vscode';
import * as moment from 'moment';
const alarm = require('alarm');
var sfx = require('sfx');

const FORMAT_DATE = `M/D/Y H:mm:ss`;

export function activate(context: vscode.ExtensionContext) {
  const reminderManager = new TaskManager();
  reminderManager.createStatusBar();

  // --------
  let getReminders = vscode.commands.registerCommand(
    'extension.getReminders',
    async () => {
      
      reminderManager
        .getTask()
        .map(
          ({ reminderName, date }) =>
            `${reminderName} - ${date.format(FORMAT_DATE)}`,
        )

        .map(vscode.window.showInformationMessage)
    },
  );

  // --------
  let createTask = vscode.commands.registerCommand(
    'extension.createReminder',
    async () => {
      const reminderName = await reminderManager.promptMessage(
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

      const date = await reminderManager.promptMessage(
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

      reminderManager.setTask({ date: momentDate, reminderName });
    },
  );

  context.subscriptions.push(createTask, getReminders);
}

export function deactivate() {}

// -----------
interface Reminder {
  date: moment.Moment;
  reminderName: string;
}
class TaskManager {
  private _reminders: Reminder[] = [];
  private statusBarText: vscode.StatusBarItem;

  setTask(data: Reminder): void {
    this._reminders.push(data);
    this.configureAlarm(data.reminderName, data.date);
  }

  getTask(): Reminder[] {
    return this._reminders;
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
    this.statusBarText.command = 'extension.getReminders';
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
