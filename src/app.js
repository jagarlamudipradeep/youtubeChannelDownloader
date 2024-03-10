import { google } from 'googleapis';
import API_KEY from '../config/apiKeys.js';
import { getChannelInfo, getPlaylistsInfo } from './api/youtubeApi.js';
import { writePlaylistsDetailsToExcelFile } from './excel/excelWriter.js';
import { downloadPlaylists } from './utils/youtubeUtils.js';
import { createChannelDir } from './utils/fileUtils.js';
import { error } from 'console';

/**
 * Downloads a YouTube channel including all playlists and videos within specified index range.
 * @param {string} channelName - The name of the YouTube channel.
 * @param {number} fromIndex - The index of the first playlist to download.
 * @param {number} toIndex - The index of the last playlist to download.
 * @param {number} noOfVideosDownloadAtaTime - The number of videos to download at a time.
 */
async function downloadYoutubeChannel(channelName, fromIndex, toIndex, noOfVideosDownloadAtaTime) {
    try {
        const youtube = google.youtube({
            version: "v3",
            auth: API_KEY,
        });

        const channelInfo = await getChannelInfo(youtube, channelName);
        if (channelInfo) {
            console.log(`Channel ID: ${channelInfo.channelId} for channel name: ${channelName}`);

            const playlistsInfo = await getPlaylistsInfo(youtube, channelInfo.channelId);
            if (playlistsInfo.totalResults) {
                console.log(`Total number of playlists: ${playlistsInfo.totalResults}, playlists array length: ${playlistsInfo.playlists.length}`);

                writePlaylistsDetailsToExcelFile(playlistsInfo.playlists, channelName);

                const channelDir = createChannelDir(channelName);

                await downloadPlaylists(youtube, channelDir, playlistsInfo, fromIndex, toIndex, noOfVideosDownloadAtaTime);

                console.log(`\n*******************Completed Downloading All Playlists in ${channelName} *******************\n`);
            } else {
                console.log(`No Playlists found in ${channelName}`);
            }
        } else {
            console.log(`Channel ${channelName} not found`);
        }
    } catch (error) {
        console.error(`Error downloading YouTube channel ${channelName}: ${error.message}`);
    }
}

downloadYoutubeChannel("AmericaChowrasta", 1, 0, 10);
