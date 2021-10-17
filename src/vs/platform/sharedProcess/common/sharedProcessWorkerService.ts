/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { hash as hashObject } from 'vs/base/common/hash';
import { createDecorator } from 'vs/platform/instantiation/common/instantiation';

export interface ISharedProcessWorkerProcess {

	/**
	 * The module to load as child process into the worker.
	 */
	moduleId: string;

	/**
	 * The type of the process appears in the arguments of the
	 * forked process to identify it easier.
	 */
	type: string;
}

export interface ISharedProcessWorkerConfiguration {

	/**
	 * Configuration specific to the process to fork.
	 */
	process: ISharedProcessWorkerProcess;

	/**
	 * Configuration specific for how to respond with the
	 * communication message port to the receiver window.
	 */
	reply: {
		windowId: number;
		channel: string;
		nonce: string;
	};
}

/**
 * Converts the process configuration into a hash to
 * identify processes of the same kind by taking those
 * components that make the process and reply unique.
 */
export function hash(configuration: ISharedProcessWorkerConfiguration): number {
	return hashObject({
		moduleId: configuration.process.moduleId,
		windowId: configuration.reply.windowId,
		channelId: configuration.reply.channel
	});
}

export const ISharedProcessWorkerService = createDecorator<ISharedProcessWorkerService>('sharedProcessWorkerService');

export const ipcSharedProcessWorkerChannelName = 'sharedProcessWorker';

export interface ISharedProcessWorkerService {

	readonly _serviceBrand: undefined;

	/**
	 * Will fork a new process with the provided module identifier off the shared
	 * process and establishes a message port connection to that process. The other
	 * end of the message port connection will be sent back to the calling window
	 * as identified by the `reply` configuration.
	 *
	 * Requires the forked process to be AMD module that uses our IPC channel framework
	 * to respond to the provided `channelName` as a server.
	 *
	 * The process will be automatically terminated when the receiver window closes,
	 * crashes or loads/reloads. It can also explicitly be terminated by calling
	 * `disposeWorker`.
	 */
	createWorker(configuration: ISharedProcessWorkerConfiguration): Promise<void>;

	/**
	 * Terminates the process for the provided configuration if any.
	 */
	disposeWorker(configuration: ISharedProcessWorkerConfiguration): Promise<void>;
}