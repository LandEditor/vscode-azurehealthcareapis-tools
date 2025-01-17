/*!
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License. See License in the project root for license information.
 */

import * as vscode from "vscode";

export async function showResultEditor(
	resultFilePath: vscode.Uri,
	viewColumn = vscode.ViewColumn.Three,
) {
	return await vscode.window.showTextDocument(
		await vscode.workspace.openTextDocument(resultFilePath),
		{
			viewColumn: viewColumn,
			preview: true,
		},
	);
}
