import os from 'os'
import ytdl from 'ytdl-core'
import SpotifyDlError from './Error'
import { readFile, unlink, writeFile } from 'fs-extra'
import axios from 'axios'
import Ffmpeg from 'fluent-ffmpeg'

/**
 * Function to download the give `YTURL`
 * @param {string} url The youtube URL to download
 * @returns `Buffer`
 * @throws Error if the URL is invalid
 */
export const downloadYT = async (url: string): Promise<Buffer> => {
    if (!ytdl.validateURL(url)) throw new SpotifyDlError('Invalid YT URL', 'SpotifyDlError')
    const filename = `${os.tmpdir()}/${Math.random().toString(36).slice(-5)}.mp3`
    const stream = ytdl(url, {
        requestOptions: {
            headers: {
                cookie: 'ISITOR_INFO1_LIVE=C0N8P8YKBPA; PREF=tz=America.Bogota&f5=20000; VISITOR_PRIVACY_METADATA=CgJQRRICGgA%3D; YSC=F124HPwH5Tk; HSID=ANMLlrOaE0U-Y9XCx; SSID=A7jofnRgyop0pJcA8; APISID=n6SY-W-U79WMcMi5/ANLbUtthWezCHSl58; SAPISID=7I0Je63HDw5qNtsd/A6kfwXpaWpL9oWNCS; __Secure-1PAPISID=7I0Je63HDw5qNtsd/A6kfwXpaWpL9oWNCS; __Secure-3PAPISID=7I0Je63HDw5qNtsd/A6kfwXpaWpL9oWNCS; YTSESSION-1b=ANPz9Kj3kneHXWVd/cloLDglSZTXhG+rbQ+5A7pXe4ThWYQ8rHRQr/mpDnEVOIc4PEpOo34pArbBqPItpFUmcRF7rBrbvY8o3qIyjm7pPyQcuuM=; GPS=1; SID=aQizKdEFw5-p5KcnHIHgPWALDWZSyYJmFsyl7wWOi7fu_X8gTdvx6Oug-zMeHzNA-0hvLw.; __Secure-1PSID=aQizKdEFw5-p5KcnHIHgPWALDWZSyYJmFsyl7wWOi7fu_X8gzfBOB25007gw93sW0fZZBw.; __Secure-1PSIDTS=sidts-CjIBSAxbGSjJ0ofY2vRCVz8xqU2RHXjyE-VqNeez6nkw8jvOZ5xtUFTPzutu1nM3OvSrJxAA; __Secure-3PSIDTS=sidts-CjIBSAxbGSjJ0ofY2vRCVz8xqU2RHXjyE-VqNeez6nkw8jvOZ5xtUFTPzutu1nM3OvSrJxAA; __Secure-3PSID=aQizKdEFw5-p5KcnHIHgPWALDWZSyYJmFsyl7wWOi7fu_X8g6hK1AfHBNbTFevBaBQPuvA.; LOGIN_INFO=AFmmF2swRQIhAIuauIKMJskoIcXPzomtvy4859ECXJjXKwIL4Fwqi8M-AiBi3HsuFHlV7lQ1cmm3p0MA9MZSsdNDL3RLqyb_aLrKMw:QUQ3MjNmemZrTWlwS2dIcm81YnNzTFRwVVFlLUF6bGh1TzV0ZWpMSFRRYm9XdHdMYnFVUV9kcWNVTVF2QXpzSWROYzE4YkM1RzU2ZjdjUk1BWTFRTm5FS1lFVHpkVXplUzF1ZGhmMTJvZW9Ca2x1Y24zTDl3bG1tSEFILWlWX2ZNRDBCVm9RSm9EZnJPMkFyMUJqaE9uR2xoM3hyVXJWbWtn; CONSISTENCY=AKreu9spRAFkKxEWfUje5J-netwXc64KTkz8ZxGkb2fS0jSkvw7HS3ZlNxyUNMoWb1_0Kzj4kSS6Wb0tulfITpFGHwYqDQyEvRz4lyfhoJV4U9Pa1V7XYEzG5c8QhUyn-KE21gCuwrCyYoLt295cpHM; SIDCC=APoG2W_12yoyWkHPHg7DjiiKJB01vkwulDW9v2gIuS0mUCIpDl7SGkQ8ywiYcwBXal5jnLxZ01s; __Secure-1PSIDCC=APoG2W9XogiNUjt9CjAlbVSb0YTrBJlo_rvOXGqodWmCwyDW_3SPyDLi9b1Co99YVhvhXvlWWPY; __Secure-3PSIDCC=APoG2W8Koq32WwziWG7m1gPuRhj8dxVpdIFrjbUM6rA2vH7wUY-cE16wy6XKz8QfLOuyKshzVjJa'
            }
        },
        quality: 'highestaudio',
        filter: 'audioonly'
    })
    return await new Promise((resolve, reject) => {
        Ffmpeg(stream)
            .audioBitrate(128)
            .save(filename)
            .on('error', (err) => reject(err))
            .on('end', async () => {
                const buffer = await readFile(filename)
                unlink(filename)
                resolve(buffer)
            })
    })
}

/**
 * Function to download and save audio from youtube
 * @param url URL to download
 * @param filename the file to save to
 * @returns filename
 */
export const downloadYTAndSave = async (
    url: string,
    filename = (Math.random() + 1).toString(36).substring(7) + '.mp3'
): Promise<string> => {
    const audio = await downloadYT(url)
    try {
        await writeFile(filename, audio)
        return filename
    } catch (err) {
        throw new SpotifyDlError(`Error While writing to File: ${filename}`)
    }
}

/**
 * Function to get buffer of files with their URLs
 * @param url URL to get Buffer of
 * @returns Buffer
 */
export const getBufferFromUrl = async (url: string): Promise<Buffer> =>
    (await axios.get(url, { responseType: 'arraybuffer' })).data
