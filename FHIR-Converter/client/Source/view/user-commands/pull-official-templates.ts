/*!
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License. See License in the project root for license information.
 */

import * as constants from "../../core/common/constants/template-management";
import { TemplateType } from "../../core/common/enum/template-type";
import { getAcrTags, getToken } from "../../core/http/acr-request";
import localize from "../../i18n/localize";
import { showQuickPick } from "../common/input/quick-pick";
import { pullImage } from "../common/registry/pull-image";

export async function pullOfficialTemplatesCommand() {
	// Get all template version tags on the ACR
	const tokenUrl = constants.OfficialRepoTokenUrl;

	const token = await getToken(tokenUrl);

	// Get the template type
	const selectedTemplateType = await showQuickPick(
		localize("message.selectTemplateType"),
		Object.values(TemplateType),
	);

	let tagsUrl, templateImageBaseReference;

	tagsUrl = constants.ImageTagsUrls[selectedTemplateType];

	templateImageBaseReference =
		constants.TemplateImageBaseReferences[selectedTemplateType];

	if (tagsUrl && templateImageBaseReference) {
		const tags = await getAcrTags(tagsUrl, token);
		// Get the version
		const selectedVersion = await showQuickPick(
			localize("message.selectTemplateVesion"),
			tags,
		);

		if (selectedVersion) {
			// If user selected a version, pull the image with this verison
			const imageReference = `${templateImageBaseReference}:${selectedVersion}`;

			await pullImage(
				imageReference,
				localize("message.pullingTemplates"),
			);
		}
	}
}
