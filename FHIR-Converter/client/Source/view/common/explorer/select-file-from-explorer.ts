/*!
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License. See License in the project root for license information.
 */

import * as stateConstants from "../../../core/common/constants/workspace-state";
import { FileType } from "../../../core/common/enum/file-type";
import { ConversionError } from "../../../core/common/errors/conversion-error";
import { globals } from "../../../core/globals";
import localize from "../../../i18n/localize";
import { setStatusBar } from "../status-bar/set-status-bar";

export async function selectFileFromExplorer(event: any, type: FileType) {
	if (event && event.fsPath) {
		// Update the active files
		if (type === FileType.Data) {
			await globals.settingManager.updateWorkspaceState(
				stateConstants.DataKey,
				event.fsPath,
			);
		} else if (type === FileType.Template) {
			await globals.settingManager.updateWorkspaceState(
				stateConstants.TemplateKey,
				event.fsPath,
			);
		}
		// Set status bar
		setStatusBar();
	} else {
		throw new ConversionError(localize("message.failSelectFile"));
	}
}
