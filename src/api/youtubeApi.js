/**
 * Retrieves information about a YouTube channel.
 * @param {Object} youtube - The YouTube API instance.
 * @param {string} channelName - The name of the YouTube channel.
 * @returns {Object} - Information about the channel.
 */
async function getChannelInfo(youtube, channelName) {
    try {
        const channelDetails = await youtube.search.list({
            part: "id",
            q: channelName,
            type: "channel",
            maxResults: 1,
        });
        const channelId = channelDetails?.data?.items?.[0]?.id?.channelId;
        return channelId ? { channelId } : null;
    } catch (error) {
        console.error("Error fetching channel information:", error.message);
        throw error;
    }
}

/**
 * Retrieves information about playlists in a YouTube channel.
 * @param {Object} youtube - The YouTube API instance.
 * @param {string} channelId - The ID of the channel.
 * @returns {Object} - Information about the playlists.
 */
async function getPlaylistsInfo(youtube, channelId) {
    try {
        let nextPageToken = "";
        let hasNextPage = true;
        const playlistsInfo = { totalResults: 0, playlists: [] };

        while (hasNextPage) {
            const playlists = await youtube.playlists.list({
                part: "snippet,contentDetails",
                channelId: channelId,
                pageToken: nextPageToken,
                maxResults: 50, // Maximum number of results to return (can be up to 50)
            });
            const playlistData = playlists?.data?.items || [];
            for (const {
                id,
                snippet: { title },
                contentDetails: { itemCount },
            } of playlistData) {
                playlistsInfo.playlists.push({ id, title, videosCount: itemCount });
            }

            if (playlists?.data?.nextPageToken) {
                nextPageToken = playlists.data.nextPageToken;
            } else {
                playlistsInfo.totalResults =
                    playlists?.data?.pageInfo?.totalResults || 0;
                hasNextPage = false;
            }
        }
        return playlistsInfo;
    } catch (error) {
        console.error("Error fetching playlists information:", error.message);
        throw error;
    }
}

/**
 * Retrieves information about videos in a YouTube playlist.
 * @param {Object} youtube - The YouTube API instance.
 * @param {string} playlistId - The ID of the playlist.
 * @returns {Object} - Information about the videos.
 */
async function getvideosInfo(youtube, playlistId) {
    try {
        let nextPageToken = "";
        let hasNextPage = true;
        const videosInfo = { totalResults: 0, videos: [] };

        while (hasNextPage) {
            const videos = await youtube.playlistItems.list({
                part: "snippet,contentDetails,status",
                playlistId: playlistId,
                pageToken: nextPageToken,
                maxResults: 50, // Maximum number of results to return (can be up to 50)
            });
            const videosData = videos?.data?.items || [];
            for (const {
                snippet: {
                    resourceId: { videoId },
                    title,
                },
                status: { privacyStatus },
            } of videosData) {
                videosInfo.videos.push({ id: videoId, title, privacyStatus });
            }

            if (videos?.data?.nextPageToken) {
                nextPageToken = videos.data.nextPageToken;
            } else {
                videosInfo.totalResults = videos?.data?.pageInfo?.totalResults || 0;
                hasNextPage = false;
            }
        }
        return videosInfo;
    } catch (error) {
        console.error("Error fetching videos information:", error.message);
        throw error;
    }
}

export { getChannelInfo, getPlaylistsInfo, getvideosInfo };
