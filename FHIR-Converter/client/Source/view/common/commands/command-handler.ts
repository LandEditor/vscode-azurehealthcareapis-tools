/*!
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License. See License in the project root for license information.
 */

import * as configurationConstants from "../../../core/common/constants/workspace-configuration";
import { ConfigurationError } from "../../../core/common/errors/configuration-error";
import { ConversionError } from "../../../core/common/errors/conversion-error";
import { PlatformHandler } from "../../../core/platform/platform-handler";
import localize from "../../../i18n/localize";
import { reporter } from "../../../telemetry/telemetry";
import * as errorHandler from "../error/error-handler";
import { converterWorkspaceExists } from "../workspace/converter-workspace-exists";

const commandsNeedWorkspace = [
	"selectDataCommand",
	"selectTemplateCommand",
	"convertCommand",
	"updateTemplateFolderCommand",
];

export async function commandHandler(event) {
	try {
		// Check if the operating system is supported.
		if (!PlatformHandler.getInstance().isSupportedOS()) {
			throw new ConversionError(localize("message.osNotSupported"));
		}

		// Check if converter workspace exists
		if (
			commandsNeedWorkspace.includes(this.name) &&
			!converterWorkspaceExists(
				configurationConstants.WorkspaceFileExtension,
			)
		) {
			throw new ConfigurationError(
				localize("message.needCreateWorkspace"),
			);
		}

		// Execute the command
		const startTime = new Date().getTime();

		await this(event);

		const costTime = new Date().getTime() - startTime;

		// Telemetry for commands
		reporter.sendTelemetryEvent(
			"command",
			{ command: this.name },
			{ costTime: costTime },
		);
	} catch (error) {
		// Handle the error
		await errorHandler.handle(error);
	}
}
