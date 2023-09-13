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
                cookie: 'VISITOR_INFO1_LIVE=C0N8P8YKBPA; PREF=tz=America.Bogota&f5=20000; VISITOR_PRIVACY_METADATA=CgJQRRICGgA%3D; HSID=ANMLlrOaE0U-Y9XCx; SSID=A7jofnRgyop0pJcA8; APISID=n6SY-W-U79WMcMi5/ANLbUtthWezCHSl58; SAPISID=7I0Je63HDw5qNtsd/A6kfwXpaWpL9oWNCS; __Secure-1PAPISID=7I0Je63HDw5qNtsd/A6kfwXpaWpL9oWNCS; __Secure-3PAPISID=7I0Je63HDw5qNtsd/A6kfwXpaWpL9oWNCS; LOGIN_INFO=AFmmF2swRQIhAIuauIKMJskoIcXPzomtvy4859ECXJjXKwIL4Fwqi8M-AiBi3HsuFHlV7lQ1cmm3p0MA9MZSsdNDL3RLqyb_aLrKMw:QUQ3MjNmemZrTWlwS2dIcm81YnNzTFRwVVFlLUF6bGh1TzV0ZWpMSFRRYm9XdHdMYnFVUV9kcWNVTVF2QXpzSWROYzE4YkM1RzU2ZjdjUk1BWTFRTm5FS1lFVHpkVXplUzF1ZGhmMTJvZW9Ca2x1Y24zTDl3bG1tSEFILWlWX2ZNRDBCVm9RSm9EZnJPMkFyMUJqaE9uR2xoM3hyVXJWbWtn; SID=awizKVjIx6b6ROiE6wYongNbjrfl-leJfkcS_ZAeH9SqM-n2x47Vz_dAf9FRaGr5j7JA_Q.; __Secure-1PSID=awizKVjIx6b6ROiE6wYongNbjrfl-leJfkcS_ZAeH9SqM-n2aQdtq28gf-laroN2MwncSg.; __Secure-3PSID=awizKVjIx6b6ROiE6wYongNbjrfl-leJfkcS_ZAeH9SqM-n2kIX73GteQGRAp1bbO3ryvQ.; YSC=cpuMZryROxg; __Secure-1PSIDTS=sidts-CjIBSAxbGZz4mbcawWidzNI4JhT39W1kQuMS6dkp28JS2cWz6460D3vEfh98ZQlWmu4qdBAA; __Secure-3PSIDTS=sidts-CjIBSAxbGZz4mbcawWidzNI4JhT39W1kQuMS6dkp28JS2cWz6460D3vEfh98ZQlWmu4qdBAA; SIDCC=APoG2W--uSb8t8sS6-4wIabaWflS-_kSnzks29uBJwVcClpeG9LrvrfK_izQLvMJXuQsuy7eQr8; __Secure-1PSIDCC=APoG2W-L2hWP92qvoffOuPp0kaSYnZSPx7Q4SwcxXkmxc4yzyTx8c_tiCevNx4X97YlVAr14-X8; __Secure-3PSIDCC=APoG2W9_mfUswRr-bZXUDozQEXyd3xaa-f3aX-5KEeBZh4B9MYiaBdGCEuk5ayoVi1-LqQ4CDBfp'
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
