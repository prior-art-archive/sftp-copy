import AWS from 'aws-sdk';
import uuid from 'uuid';

import logger from './logger';
import {
	isObjectEmpty,
	doesObjectHaveValidExtension,
	getOrganizationSlug,
	getOrganizationId,
	getSrcHead,
	getDecodedSrcKey,
	getExtension,
} from './utils';
import {
	SOURCE_BUCKET,
	DESTINATION_BUCKET,
} from './constants';

const s3 = new AWS.S3();

exports.handler = async (event, context, callback) => {
	const {
		s3: {
			object,
		},
	} = event.Records[0];
	logger.info(`Processing object: ${object.key}`);

	const srcKey = getDecodedSrcKey(object);
	const extension = getExtension(object);
	const organizationSlug = getOrganizationSlug(object);

	if (isObjectEmpty(object)) {
		logger.info('Cannot process upload (empty file)');
		return callback(null, '0 Size');
	}
	if (!doesObjectHaveValidExtension(object)) {
		logger.info(`Cannot process upload (invalid extension: ${extension})`);
		return callback(null, 'Invalid Extension');
	}

	let organizationId;
	try {
		organizationId = await getOrganizationId(organizationSlug);
	} catch (e) {
		logger.warn('Error getting the organization ID');
		return callback(e);
	}

	let srcHead;
	try {
		srcHead = await getSrcHead(SOURCE_BUCKET, srcKey);
	} catch (e) {
		logger.warn('Error getting the source head');
		return callback(e);
	}

	const documentId = uuid();
	const destKey = `uploads/${organizationId}/${documentId}.${extension}`;
	logger.info(`Copying object to ${destKey}`);
	return s3.copyObject({
		CopySource: `${SOURCE_BUCKET}/${srcKey}`,
		Bucket: DESTINATION_BUCKET,
		ACL: 'public-read',
		Key: destKey,
		ContentType: srcHead.ContentType,
		Metadata: {
			...srcHead.Metadata,
			'document-id': documentId,
			'original-filename': srcKey.replace(`${organizationSlug}/`, ''),
		},
		MetadataDirective: 'REPLACE',
	})
		.promise()
		.catch((copyErr) => {
			logger.warn('Copy failed');
			logger.warn(copyErr);
			return callback(copyErr);
		})
		.then((result) => {
			logger.info(`Copied ${srcKey} to ${destKey}`);
			logger.info(result);
			return callback(null, `Copied ${srcKey} to ${destKey}`);
		});
};
