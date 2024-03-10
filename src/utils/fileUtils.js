import fs from 'fs';
import path from 'path';
import { replaceString } from './commonUtils.js';

/**
 * Creates a directory at the specified path with the given folder name.
 * If the basePath doesn't exist, it will be created.
 * @param {string} basePath - The base path where the folder will be created.
 * @param {string} folderName - The name of the folder to be created.
 * @returns {string} - The full path of the created folder.
 */
function createDir(basePath, folderName) {
  try {
    if (!fs.existsSync(basePath)) {
      fs.mkdirSync(basePath, { recursive: true });
    }

    const targetDir = path.join(basePath, folderName);
    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir);
      console.log(`Created folder at ${targetDir}`);
    } else {
      console.log(`Folder already exists at ${targetDir}`);
    }

    return targetDir;
  } catch (error) {
    console.error(`Error creating directory: ${error.message}`);
    throw error;
  }
}

/**
 * Create a directory for a specific channel.
 * @param {string} channelName - The name of the channel.
 * @returns {string} - The path to the created channel directory.
 */
function createChannelDir(channelName) {
  try {
    const __dirname = path.resolve();
    const downloadedChannelsDir = path.join(__dirname, "downloadedChannels");
    const replacedChannelName = replaceString(channelName);
    const channelDir = createDir(downloadedChannelsDir, replacedChannelName);

    return channelDir;
  } catch (error) {
    console.error(`Error creating channel directory: ${error.message}`);
    throw error;
  }
}

export { createDir, createChannelDir };