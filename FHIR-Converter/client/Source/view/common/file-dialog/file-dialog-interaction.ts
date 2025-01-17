/*!
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License. See License in the project root for license information.
 */

import * as path from "path";
import * as vscode from "vscode";

import { MetadataType } from "../../../core/common/enum/metadata-type";
import * as fileUtils from "../../../core/common/utils/file-utils";
import localize from "../../../i18n/localize";
import { showQuickPick } from "../../common/input/quick-pick";

export async function openDialogSelectFolder(
	label: string,
	defaultUri: string | undefined = undefined,
) {
	const options = {
		canSelectMany: false,
		canSelectFiles: false,
		canSelectFolders: true,
		openLabel: label,
	};

	if (defaultUri) {
		options["defaultUri"] = vscode.Uri.file(defaultUri);
	}

	const selectedFolder = await vscode.window.showOpenDialog(options);

	if (!selectedFolder) {
		return undefined;
	} else {
		return selectedFolder[0];
	}
}

export async function showDialogSaveWorkspace(
	label: string,
	filter: string,
	defaultUri: string | undefined = undefined,
) {
	const options = { saveLabel: label, filters: { "workspace": [filter] } };

	if (defaultUri) {
		options["defaultUri"] = vscode.Uri.file(defaultUri);
	}

	const workspacePath = await vscode.window.showSaveDialog(options);

	if (!workspacePath) {
		return undefined;
	} else {
		return workspacePath;
	}
}

export async function askSaveFiles(
	unsavedFiles: vscode.TextDocument[],
	infoMessage: string,
	acceptButtonLabel: string,
	rejectButtonLabel: string,
) {
	return await vscode.window
		.showWarningMessage(infoMessage, acceptButtonLabel, rejectButtonLabel)
		.then(async function (select) {
			if (select === acceptButtonLabel) {
				await saveAllFiles(unsavedFiles);
			}
		});
}

export async function askCreateMetadata(
	infoMessage: string,
	createButtonLabel: string,
	templateFolder: string,
) {
	return await vscode.window
		.showErrorMessage(infoMessage, createButtonLabel)
		.then(async function (select) {
			if (select === createButtonLabel) {
				const selectedTemplateType = await showQuickPick(
					localize("message.selectTemplateType"),
					Object.keys(MetadataType),
				);

				let metadata = { type: MetadataType[selectedTemplateType] };

				const metadataPath = path.join(templateFolder, "metadata.json");

				fileUtils.writeJsonToFile(metadataPath, metadata);

				vscode.window.showInformationMessage(
					localize("message.createdMetadata", templateFolder),
				);
			}
		});
}

export function getUnsavedFiles(type: string) {
	const unsavedFiles: vscode.TextDocument[] = [];

	for (const doc of vscode.workspace.textDocuments) {
		if (doc && doc.isDirty && path.extname(doc.fileName) === type) {
			unsavedFiles.push(doc);
		}
	}

	return unsavedFiles;
}

export async function saveAllFiles(unsavedFiles: vscode.TextDocument[]) {
	await Promise.all(unsavedFiles.map((doc) => doc.save()));
}

export function isDirtyFile(filePath: string) {
	if (filePath) {
		for (const doc of vscode.workspace.textDocuments) {
			if (doc && doc.isDirty && doc.fileName === filePath) {
				return doc;
			}
		}
	}

	return undefined;
}
