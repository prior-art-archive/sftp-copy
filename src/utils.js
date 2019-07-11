import request from 'request-promise';
import AWS from 'aws-sdk';

import logger from './logger';
import { ALLOWED_EXTENSIONS } from './constants';

const s3 = new AWS.S3();

export const isObjectEmpty = object => object.size === 0;

export const getOrganizationSlug = object => object.key.split('/')[0];

export const getDecodedSrcKey = object => decodeURI(object.key);

export const getExtension = object => getDecodedSrcKey(object).split('.').pop().toLowerCase();

export const doesObjectHaveValidExtension = object => ALLOWED_EXTENSIONS
	.includes(getExtension(object));

export const getOrganizationId = async companySlug => request({
	uri: `${process.env.idResolverUrl}?slug=${companySlug}`,
	json: true,
});

export const getSrcHead = async (srcBucket, srcKey) => s3
	.headObject({
		Bucket: srcBucket,
		Key: srcKey,
	})
	.promise()
	.catch((err) => {
		logger.warn(err);
	});
