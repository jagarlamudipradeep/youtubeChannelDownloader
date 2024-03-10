import XLSX from 'xlsx';
import path from 'path';
import { createDir } from '../utils/fileUtils.js';

/**
 * Writes playlist details to an Excel file.
 * @param {Array} playlists - An array of playlists.
 * @param {string} channelName - The name of the YouTube channel.
 */
function writePlaylistsDetailsToExcelFile(playlists, channelName) {
  try {
    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet(playlists);

    XLSX.utils.book_append_sheet(workbook, worksheet, 'Playlists');

    const __dirname = path.resolve();
    const excelDir = createDir(__dirname, "excelFiles");
    const filename = `${excelDir}/${channelName} playlists.xlsx`;
    XLSX.writeFile(workbook, filename);

    console.log(`Data written to ${filename}`);
  } catch (error) {
    console.error(`Error writing playlists details to Excel file: ${error.message}`);
    throw error;
  }
}

export { writePlaylistsDetailsToExcelFile };
