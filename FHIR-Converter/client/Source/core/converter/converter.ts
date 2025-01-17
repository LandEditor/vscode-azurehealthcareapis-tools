/*!
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License. See License in the project root for license information.
 */

import * as fs from "fs";

import * as engineConstants from "../common/constants/engine";
import * as fileUtils from "../common/utils/file-utils";
import * as stringUtils from "../common/utils/string-utils";
import { IConverterEngine } from "./engine/converter-engine";

export class Converter {
	private _engine: IConverterEngine;

	private _resultFolder: string;

	constructor(engine: IConverterEngine, resultFolder: string) {
		this._engine = engine;

		this._resultFolder = resultFolder;
	}

	async convert(dataFile: string) {
		const result = this._engine.process(dataFile);

		await this.clearHistory(result.resultFile);

		return result;
	}

	getHistory(filePath: string) {
		const resultName = stringUtils.getFileNameWithoutTwoExt(filePath);

		const files: string[] = fileUtils.getAllPaths(
			this._resultFolder,
			`/**/${resultName}.*.json`,
		);

		const sortedFiles = stringUtils.getDescendingSortString(files);

		return sortedFiles;
	}

	async clearHistory(
		filePath: string,
		maxNum = engineConstants.MaxHistoryFilesNum,
		remainNum = engineConstants.RemainHistoryFilesNum,
	) {
		const files = this.getHistory(filePath);

		if (files.length > maxNum) {
			const deleteFiles = files.slice(remainNum, files.length);

			const promiseAll = [];

			for (const file of deleteFiles) {
				promiseAll.push(
					new Promise<void>((resolve, reject) => {
						fs.unlink(file, (err) => {
							if (err) {
								reject(err);
							} else {
								resolve();
							}
						});
					}),
				);
			}

			await Promise.all(promiseAll);
		}
	}
}
