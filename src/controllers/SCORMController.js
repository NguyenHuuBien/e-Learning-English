import axios from 'axios';
import FormData from 'form-data';
import fs from 'fs';
import unzipper from 'unzipper';
import xml2js from 'xml2js';
import path from 'path';

const SCORM_CLOUD_API_URL = 'https://cloud.scorm.com/api/v2';
const API_KEY = 'B7V0WXGTMK';
const API_SECRET = '6OoSGydjgBHdnud4AdBOnP7f3TpcXY4jdMDn4dY0';

export const checkUploadStatus = async (jobId) => {
    try {
        const response = await axios.get(
            `${SCORM_CLOUD_API_URL}/courses/importJobs/${jobId}`,
            {
                headers: {
                    'Authorization': `Basic ${Buffer.from(`${API_KEY}:${API_SECRET}`).toString('base64')}`
                }
            }
        );
        return response.data.status === 'completed';
    } catch (error) {
        console.error('Error checking upload status:', error);
        throw error;
    }
};


export const uploadScormFile = async (filePath, courseId) => {
    try {
        const form = new FormData();
        form.append('file', fs.createReadStream(filePath));

        // Bước 1: Tạo yêu cầu tải lên
        const response = await axios.post(
            `${SCORM_CLOUD_API_URL}/courses/importJobs/upload`,
            form,
            {
                params: {
                    courseId: courseId
                },
                headers: {
                    ...form.getHeaders(),
                    'Authorization': `Basic ${Buffer.from(`${API_KEY}:${API_SECRET}`).toString('base64')}`
                }
            }
        );

        const jobId = response.data.jobId;
        if (!jobId) return false;

        // Bước 2: Kiểm tra trạng thái tải lên
        let isCompleted = false;
        while (!isCompleted) {
            isCompleted = await checkUploadStatus(jobId);
            if (!isCompleted) {
                await new Promise(resolve => setTimeout(resolve, 5000)); // Chờ 5 giây trước khi kiểm tra lại
            }
        }

        return true;
    } catch (error) {
        console.error('Error uploading SCORM file:', error);
        throw error;
    }
};


export const extractManifestTitle = async (zipFilePath) => {
    return new Promise((resolve, reject) => {
        fs.createReadStream(zipFilePath)
            .pipe(unzipper.Parse())
            .on('entry', async (entry) => {
                const fileName = entry.path;
                if (fileName === 'imsmanifest.xml') {
                    let xmlData = '';
                    entry.on('data', chunk => {
                        xmlData += chunk;
                    });
                    entry.on('end', () => {
                        xml2js.parseString(xmlData, (err, result) => {
                            if (err) {
                                reject(err);
                            } else {
                                try {
                                    const title = result.manifest.organizations[0].organization[0].title[0];
                                    resolve(title);
                                } catch (error) {
                                    reject(new Error('Error extracting title from manifest'));
                                }
                            }
                        });
                    });
                } else {
                    entry.autodrain();
                }
            })
            .on('error', err => {
                reject(err);
            });
    });
}

export const createRegistration = async (courseId, learnerId, learnerFirstName, learnerLastName) => {
    try {
        const registrationUrl = 'https://cloud.scorm.com/api/v2/registrations';
        const registrationId = `reg_${learnerId}_${courseId}`;

        await axios.post(registrationUrl, {
            courseId: courseId,
            registrationId: registrationId,
            learner: {
                id: learnerId,
                firstName: learnerFirstName,
                lastName: learnerLastName
            },
        }, {
            headers: {
                'Authorization': `Basic ${Buffer.from(`${API_KEY}:${API_SECRET}`).toString('base64')}`
            }
        });

    } catch (error) {
        console.error(error);
        throw error;
    }
}
const urlScorm = async (courseId, learnerId) => {
    const registrationId = `reg_${learnerId}_${courseId}`;
    const launchUrl = `https://cloud.scorm.com/api/v2/registrations/${registrationId}/launchLink`;

    const launchResponse = await axios.post(launchUrl, {
        redirectOnExitUrl: "http://localhost:3000/courses",

    }, {
        headers: {
            'Authorization': `Basic ${Buffer.from(`${API_KEY}:${API_SECRET}`).toString('base64')}`
        }
    });

    return launchResponse.data.launchLink;
}

export const scormLanch = async ({ user, body }) => {
    const link = await urlScorm(body.course_code, user._id)
    return link
}

export const deleteCourse = async (courseId) => {
    try {
        const response = await axios.delete(`https://cloud.scorm.com/api/v2/courses/${courseId}`, {
            headers: {
                'Authorization': `Basic ${Buffer.from(`${API_KEY}:${API_SECRET}`).toString('base64')}`
            }
        });

        console.log('Course deleted successfully');
    } catch (error) {
        console.error('Error deleting course:', error.response ? error.response.data : error.message);
    }
}