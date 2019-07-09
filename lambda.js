import AWS = from 'aws-sdk';
import uuidv4 = from 'uuid/v4';
import request = from 'request-promise';

import logger = from './logger';
import { DESTINATION_BUCKET } from './constants';
import {
	isObjectEmpty,
	isObjectValidExtension,
	getCompanySlug,
	getOrganizationId,
	getSrcHead,
} from './utils';

var s3 = new AWS.S3();

exports.handler = async (event, context, callback) => {
	const object = event.Records[0].s3.object
	logger.info(`Processing object: ${object.key}`)
	if (isObjectEmpty(object)) {
		logger.error(`Cannot process upload (empty file)`)
		return callback(null, '0 Size');
	}
	if (!isObjectValidExtension(object)) {
		logger.error(`Cannot process upload (invalid extension)`)
		return callback(null, 'Invalid Extension');
	}
	logger.debug(`Object validations passed`)

	const srcBucket = process.env.sourceBucket;
	const companySlug = getCompanySlug(object)
	const organizationId = await getOrganizationId(companySlug)
	const srcHead = await getSrcHead(srcBucket, srcKey)
	const documentId = uuidv4();
	const destBucket = DESTINATION_BUCKET;
	const destKey = `uploads/${organizationId}/${documentId}.${extension}`;
	logger.info(`Copying object to ${destKey}`)
	s3.copyObject({
		CopySource: srcBucket + '/' + srcKey,
		Bucket: destBucket,
		ACL: 'public-read',
		Key: destKey,
		ContentType: srcHead.ContentType,
		Metadata: {
			...srcHead.Metadata,
			'document-id': documentId,
			'original-filename': srcKey.replace(`${companySlug}/`, ''),
		},
		MetadataDirective: 'REPLACE'
	}, (copyErr, copyData)=> {
		if (copyErr) {
			logger.error('Copy failed');
			logger.error(copyErr);
			return callback(copyErr, null);
		}
		logger.info('Copied ${srcKey} to ${destKey}')
		callback(null, `Copied ${srcKey} to ${destKey}`);
	});
};
