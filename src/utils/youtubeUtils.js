import fs from 'fs';
import ytdl from 'ytdl-core';
import { replaceString, splitArrayIntoChunks } from './commonUtils.js';
import { getvideosInfo } from '../api/youtubeApi.js';
import { createDir } from './fileUtils.js';

/**
 * Downloads a single video from YouTube.
 * @param {string} playlistDirname - The directory path for the playlist.
 * @param {Object} video - Information about the video.
 * @param {string} videoTitle - The title of the video.
 * @returns {Promise} - A promise that resolves when the video is downloaded.
 */
async function downloadVideo(playlistDirname, video, videoTitle) {
    try {
        return new Promise(async function (resolve, reject) {
            if (video.privacyStatus === "public") {
                const videoUrl = `https://www.youtube.com/watch?v=${video.id}`;

                let info = await ytdl.getInfo(video.id);
                const qualityItags = ["22", "18", "136", "137", "247", "248", "135", "134"];
                let format = null;
                for (const quality of qualityItags) {
                    format = ytdl.chooseFormat(info.formats, { quality: quality });
                    if (format) {
                        break;
                    }
                }

                let videoStream = null;
                if (format) {
                    console.log(`Format found! quality: ${format.quality}, hasVideo: ${format.hasVideo}, hasAudio: ${format.hasAudio}, container: ${format.container} for [ ${videoTitle} ]`);
                    videoStream = ytdl(videoUrl, { format });
                } else {
                    console.log(`Format Not found! for [ ${videoTitle} ]`);
                    videoStream = ytdl(videoUrl);
                }

                videoStream.on("error", (err) => {
                    reject(err);
                });

                videoStream.on("end", () => {
                    resolve(true);
                });

                videoStream.pipe(fs.createWriteStream(`${playlistDirname}/${videoTitle}.mp4`));

            } else {
                reject(`This is a ${video.privacyStatus} video.`);
            }
        });
    } catch (error) {
        console.error(`Error downloading video [ ${videoTitle} ]: ${error.message}`);
        reject(error);
    }
}

/**
 * Downloads all playlist videos, processing a specified number of videos in parallel to improve download speed.
 * @param {string} playlistDirname - The directory path for the playlist.
 * @param {Object} videosInfo - Information about the videos.
 * @param {number} noOfVideosDownloadAtaTime - The number of videos to download at a time.
 */
async function downloadVideos(playlistDirname, videosInfo, noOfVideosDownloadAtaTime) {
    try {
        const videosList = videosInfo.videos;
        const groupedVideos = splitArrayIntoChunks(videosList, noOfVideosDownloadAtaTime);
        for (let index = 0; index < groupedVideos.length; index++) {
            console.log("");
            const videos = groupedVideos[index];
            const videoPromises = [];
            for (let j = 0; j < videos.length; j++) {
                const video = videos[j];
                const videoNo = noOfVideosDownloadAtaTime * index + j + 1;
                const videoTitle = `${videoNo}.) ${replaceString(video.title)}`;
                console.log(`Started downloading video ${videoNo}/${videosList.length}:   [ ${videoTitle} ]`);
                videoPromises.push(downloadVideo(playlistDirname, video, videoTitle));
            }

            const videosResult = await Promise.allSettled(videoPromises);

            for (let j = 0; j < videos.length; j++) {
                const video = videos[j];
                const videoNo = noOfVideosDownloadAtaTime * index + j + 1;
                const videoTitle = `${videoNo}.) ${replaceString(video.title)}`;
                if (videosResult[j].status === "fulfilled") {
                    console.log(`Downloaded video ${videoNo}/${videosList.length}:   [ ${videoTitle} ]`);
                } else {
                    console.error(`Error downloading video ${videoNo}/${videosList.length}:   [ ${videoTitle} ]: ${videosResult[j].reason}`);
                }
            }
        }
    } catch (error) {
        console.error(`Error downloading videos: ${error.message}`);
        throw error;
    }
}

/**
 * Downloads videos from a YouTube playlist.
 * @param {Object} youtube - The YouTube API instance.
 * @param {string} playlistDirname - The directory path for the playlist.
 * @param {Object} playlist - Information about the playlist.
 * @param {number} noOfVideosDownloadAtaTime - The number of videos to download at a time.
 */
async function downloadPlaylist(youtube, playlistDirname, playlist, noOfVideosDownloadAtaTime) {
    try {
        const videosInfo = await getvideosInfo(youtube, playlist.id);
        if (videosInfo.totalResults) {
            console.log(`Total number of videos: ${videosInfo.totalResults}, videos array length: ${videosInfo.videos.length}`);
            await downloadVideos(playlistDirname, videosInfo, noOfVideosDownloadAtaTime);
        } else {
            console.log(`No videos found in ${playlist.title}`);
        }
    } catch (error) {
        console.error(`Error downloading playlist [ ${playlist?.title} ]: ${error.message}`);
        throw error;
    }
};



/**
 * Downloads playlists within the specified index range from a YouTube channel.
 * @param {Object} youtube - The YouTube API instance.
 * @param {string} channelDir - The directory path for the channel.
 * @param {Object} playlistsInfo - Information about the playlists.
 * @param {number} fromIndex - The index of the first playlist to download.
 * @param {number} toIndex - The index of the last playlist to download.
 * @param {number} noOfVideosDownloadAtaTime - The number of videos to download at a time.
 */
async function downloadPlaylists(youtube, channelDir, playlistsInfo, fromIndex, toIndex, noOfVideosDownloadAtaTime) {
    try {
        const playlists = playlistsInfo.playlists;
        if (!fromIndex || fromIndex <= 0) {
            fromIndex = 1
        }
        if (!toIndex || toIndex <= 0 || toIndex > playlists.length) {
            toIndex = playlists.length;
        }
        for (let index = fromIndex - 1; index < toIndex; index++) {
            const playlist = playlists[index];
            const playlistDirname = createDir(channelDir, `${index + 1}.) ${replaceString(playlist.title)}`);
            console.log(`Started downloading playlist ${index + 1}/${playlists.length} ::::: ${index + 1}.) ${playlist.title}`);
            console.log("--------------------------------------------------------------------------------------------");
            await downloadPlaylist(youtube, playlistDirname, playlist, noOfVideosDownloadAtaTime);
            console.log(`\nCompleted downloading playlist ${index + 1}/${playlists.length} ::::: ${index + 1}.) ${playlist.title}`);
            console.log("--------------------------------------------------------------------------------------------\n\n");
        }
    } catch (error) {
        console.error(`Error downloading playlists: ${error.message}`);
        throw error;
    }
}

export { downloadVideo, downloadVideos, downloadPlaylist, downloadPlaylists };
