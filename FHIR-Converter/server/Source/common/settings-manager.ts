/*!
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License. See License in the project root for license information.
 */

import {
	ClientCapabilities,
	Connection,
	TextDocuments,
} from "vscode-languageserver";
import { TextDocument } from "vscode-languageserver-textdocument";

import * as constants from "../common/constants";

interface FhirConverterSettings {
	templateFolder: string;

	dataFolder: string;
}

export class SettingsManager {
	// Create a simple text document manager. The text document manager
	// supports full document sync only
	private documents: TextDocuments<TextDocument> = new TextDocuments(
		TextDocument,
	);

	// Cache the settings of all open documents
	private documentSettings: Map<string, Thenable<FhirConverterSettings>> =
		new Map();

	// The global settings, used when the `workspace/configuration` request is not supported by the client.
	// Please note that this is not the case when using this server with the client provided in this example
	// but could happen with other clients.
	private readonly defaultSettings: FhirConverterSettings = {
		templateFolder: "",
		dataFolder: "",
	};

	private globalSettings: FhirConverterSettings = this.defaultSettings;

	private hasConfigurationCapability: boolean = false;

	constructor(
		private connection: Connection,
		capabilities: ClientCapabilities,
		callback: (doc: TextDocument) => void,
	) {
		// Does the client support the `workspace/configuration` request?
		// If not, we will fall back using global settings
		this.hasConfigurationCapability = !!(
			capabilities.workspace && !!capabilities.workspace.configuration
		);

		connection.onDidChangeConfiguration((change) => {
			if (this.hasConfigurationCapability) {
				// Reset all cached document settings
				this.documentSettings.clear();
			} else {
				this.globalSettings = <FhirConverterSettings>(
					(change.settings.fhirConverter || this.defaultSettings)
				);
			}

			// Revalidate all open text documents
			this.documents.all().forEach(callback);
		});
	}

	public getDocumentSettings(
		resource: string,
	): Thenable<FhirConverterSettings> {
		if (!this.hasConfigurationCapability) {
			return Promise.resolve(this.globalSettings);
		}

		let result = this.documentSettings.get(resource);

		if (!result) {
			result = this.connection.workspace.getConfiguration({
				scopeUri: resource,
				section: constants.ConfigurationSection,
			});

			this.documentSettings.set(resource, result);
		}

		return result;
	}
}
